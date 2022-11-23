const Shotstack = require("shotstack-sdk");
const fs = require("fs");
require("dotenv").config();

let authenticate = () => {
  const defaultClient = Shotstack.ApiClient.instance;
  defaultClient.basePath = "https://api.shotstack.io/stage";

  const DeveloperKey = defaultClient.authentications["DeveloperKey"];
  DeveloperKey.apiKey = process.env.STAGE_API_KEY;
};
authenticate();

let renderVideo = async (record) => {
  let template = JSON.parse(
    fs.readFileSync("template.json", { encoding: "utf-8" })
  );

  let timeline = template.timeline;
  let output = template.output;
  
  let mergeFields = getMergeFields(record);

  let edit = new Shotstack.Edit();
  edit.setTimeline(timeline).setOutput(output).setMerge(mergeFields);

  const api = new Shotstack.EditApi();
  let renderResponse = await api.postRender(edit);
  if (renderResponse.success) {
    let renderId = renderResponse.response.id;
    console.log("rendering", record.fields.Title, renderId);
    return renderId;
  } else {
    return undefined;
  }
};

let getMergeFields = (record) => {
  let mergeDateField = new Shotstack.MergeField();
  mergeDateField.setFind("date").setReplace(record.fields.Date);

  let mergeTitleField = new Shotstack.MergeField();
  mergeTitleField.setFind("title").setReplace(record.fields.Title);

  let mergeImageField = new Shotstack.MergeField();
  mergeImageField.setFind("image_url").setReplace(record.fields.Image);

  let mergeFields = [mergeDateField, mergeTitleField, mergeImageField];
  return mergeFields;
};

let getRenderStatus = async (renderId) => {
  const api = new Shotstack.EditApi();
  let { response } = await api.getRender(renderId);
  return response;
};

module.exports = { renderVideo, getRenderStatus };
