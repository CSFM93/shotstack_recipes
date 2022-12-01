/* eslint-disable no-console */
const Airtable = require('airtable');
require('dotenv').config();

const { renderVideo, getRenderStatus } = require('./videoGenerator');

const getVideoUrl = async (renderId) => new Promise((resolve) => {
  const interval = setInterval(async () => {
    const response = await getRenderStatus(renderId);
    console.log('status', renderId, response.status);
    if (response.status === 'done') {
      const { url } = response;
      clearInterval(interval);
      resolve(url);
    }
  }, 3000);
});

const updateVideoUrlField = (table, recordID, videoURL) => {
  table.update(
    recordID,
    {
      'Video URL': videoURL,
    },
    (err, record) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('updated', record.get('Title'));
    },
  );
};

const getRecipes = async () => {
  const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
  const base = airtable.base(process.env.AIRTABLE_BASE_ID);
  const table = base.table('Recipes');

  table.select().all((err, records) => {
    records.forEach(async (record) => {
      setTimeout(async () => {
        console.log('recipe', record.fields.Title);
        const renderId = await renderVideo(record);
        if (renderId !== undefined) {
          const videoURL = await getVideoUrl(renderId);
          console.log('generated URL', record.fields.Title, videoURL);
          updateVideoUrlField(table, record.id, videoURL);
        }
      }, 500);
    });
  });
};

getRecipes();
