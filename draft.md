## Introduction

## Configuration

## Creating the project structure

In this section, you will create the directory where you will build the recipes video generator, create a Node project, and install the required dependencies.

Open a terminal window and create a new directory called `recipes`:

```bash
mkdir recipes
```

Navigate into the directory:

```bash
cd recipes
```

Now, you’ll use the following command to create a new Node.js project with default settings:

```bash
npm init -y
```

Use your preferred code editor to open the package.json file and change the `main` and `scripts` properties:

```json
{
  "name": "recipes",
  "version": "1.0.0",
  "description": "",
  "main": "recipes.js",
  "scripts": {
    "start": "node recipes.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "airtable": "^0.11.5",
    "dotenv": "^16.0.3",
    "shotstack-sdk": "^0.2.0"
  }
}
```

Here you changed the `main` and `scripts` properties. You have set the application main file to `recipes.js`. In the `scripts` property you have have added a script named `start`, which allows you to set the command that is supposed to run when you start the application. You will create the `recipes.js` file in the next section.

In your project's root directory, create a file named `.env`. In this `.env` file, you will store your Airtable Base ID and API key, and your Shotstack Stage ID and API key. The Airtable Base ID and API key will allow you to interact with your Airtable Base. The Shotstack Stage ID and API key will allow you to interact with Shotstack API and render videos.

Go back to your terminal, and run the following command to install the dependencies that you are going to use in this project:

```bash
npm install shotstack-sdk airtable dotenv
```

With the command above you installed the following dependencies:

- `shotstack-sdk`: the Node SDK for Shotstack. You are going to use this SDK to render a video for each record found in your Airtable Base table.
- `airtable`: the official Airtable JavaScript library. You are going to use this library to retrieve and update records stored in your Airtable Base table.
- `dotenv`: a zero-dependency module that loads environment variables from a `.env` file into `process.env`. You are going to use this module to retrieve the Airtable and Shotstack keys that you will store in your `.env` file.

## Storing the recipes in Airtable and retrieving The Airtable and Shotstack API keys

## Retrieving the records stored in Airtable

In your project root directory create a file name `recipes.js` and add the following code to it:

```js
const Airtable = require("airtable");
require("dotenv").config();

let getRecipes = async () => {
  let airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
  let base = airtable.base(process.env.AIRTABLE_BASE_ID);
  let table = base.table("Recipes");

  table.select().all(function (err, records) {
    records.forEach(async (record, i) => {
      console.log("recipe", record.fields.Title);
    });
  });
};

getRecipes();
```

EXPLAIN

Run the file to see the records:

```bash
npm start
```

## Using the Shotstack API to render videos

Create a file named `videoGenerator.js` and add the following code to it:

```js
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
```

EXPLAIN

Add the following code bellow the `authenticate()` function.

```js
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
```

EXPLAIN

Add the following code bellow the `renderVideo()` function:

```js
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
```

EXPLAIN

Add the following code bellow the `getMergeFields()` function:

```js
let getRenderStatus = async (renderId) => {
  const api = new Shotstack.EditApi();
  let { response } = await api.getRender(renderId);
  return response;
};

module.exports = { renderVideo, getRenderStatus };
```

EXPLAIN

## Updating the records stored in Airtable

Go to the top of your `recipes.js` file and add the following line of code to it:

```js
const { renderVideo, getRenderStatus } = require("./videoGenerator");
```

EXPLAIN

Add the following function bellow the `getRecipes()` function:

```js
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
```

EXPLAIN

Add the following function bellow the `getVideoURL()` function:

```js
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
```

EXPLAIN

Go to your `getRecipes()` function and add the following code inside the `foreach` loop:

```js
let getRecipes = async () => {
  records.forEach(async (record, i) => {
    console.log("recipe", record.fields.Title);
    let renderId = await renderVideo(record);
    if (renderId !== undefined) {
      let videoURL = await getVideoURL(renderId);
      console.log("generated URL", record.fields.Title, videoURL);
      updateVideoURLField(table, record.id, videoURL);
    }
  });
};
```

EXPLAIN

## Conclusion
