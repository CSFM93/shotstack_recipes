const Airtable = require("airtable");
require("dotenv").config();

const { renderVideo, getRenderStatus } = require("./videoGenerator");

let getRecipes = async () => {
  let airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
  let base = airtable.base(process.env.AIRTABLE_BASE_ID);
  let table = base.table("Recipes");

  table.select().all(function (err, records) {
    records.forEach(async (record, i) => {
      console.log("recipe", record.fields.Title);
      let renderId = await renderVideo(record);
      if (renderId !== undefined) {
        let videoURL = await getVideoURL(renderId);
        console.log("generated URL", record.fields.Title, videoURL);
        updateVideoURLField(table, record.id, videoURL);
      }
    });
  });
};

let getVideoURL = async (renderId) => {
  return new Promise((resolve, reject) => {
    let url = "";
    let interval = setInterval(async () => {
      let response = await getRenderStatus(renderId);
      console.log("status", renderId, response.status);
      if (response.status === "done") {
        url = response.url;
        clearInterval(interval);
        resolve(url);
      }
    }, 3000);
  });
};

let updateVideoURLField = (table, recordID, videoURL) => {
  table.update(
    recordID,
    {
      "Video URL": videoURL,
    },
    function (err, record) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("updated", record.get("Title"));
    }
  );
};

getRecipes();
