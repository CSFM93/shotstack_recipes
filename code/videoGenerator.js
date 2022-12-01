/* eslint-disable no-console */
const Shotstack = require('shotstack-sdk');
const fs = require('fs');
require('dotenv').config();

const defaultClient = Shotstack.ApiClient.instance;
defaultClient.basePath = 'https://api.shotstack.io/stage';

const { DeveloperKey } = defaultClient.authentications;
DeveloperKey.apiKey = process.env.SHOTSTACK_KEY;

const getMergeFields = (record) => {
  const mergeDateField = new Shotstack.MergeField();
  mergeDateField.setFind('date').setReplace(record.fields.Date);

  const mergeTitleField = new Shotstack.MergeField();
  mergeTitleField.setFind('title').setReplace(record.fields.Title);

  const mergeImageField = new Shotstack.MergeField();
  mergeImageField.setFind('image_url').setReplace(record.fields.Image);

  const mergeFields = [mergeDateField, mergeTitleField, mergeImageField];
  return mergeFields;
};

const renderVideo = async (record) => {
  const template = JSON.parse(
    fs.readFileSync('template.json', { encoding: 'utf-8' }),
  );

  const { timeline, output } = template;

  const mergeFields = getMergeFields(record);

  const edit = new Shotstack.Edit();
  edit.setTimeline(timeline).setOutput(output).setMerge(mergeFields);

  const api = new Shotstack.EditApi();
  const renderResponse = await api.postRender(edit);
  if (renderResponse.success) {
    const renderId = renderResponse.response.id;
    console.log('rendering', record.fields.Title, renderId);
    return renderId;
  }
  return undefined;
};

const getRenderStatus = async (renderId) => {
  const api = new Shotstack.EditApi();
  const { response } = await api.getRender(renderId);
  return response;
};

module.exports = { renderVideo, getRenderStatus };
