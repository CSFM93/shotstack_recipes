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

In this section, you will learn how to use the `airtable` module to retrieve the records stored in your Recipes' table.

In your project root directory create a file name `recipes.js` and add the following code to it:

```js
const Airtable = require("airtable");
require("dotenv").config();

let getRecipes = async () => {
  let airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
  let base = airtable.base(process.env.AIRTABLE_BASE_ID);
  let table = base.table("Recipes");

  table.select().all(function (err, records) {
    records.forEach(async (record) => {
      console.log("recipe", record.fields.Title);
    });
  });
};

getRecipes();
```
In the block of code a above, first you required the `airtable` and `dotenv` modules.

Bellow the require statements, you created a function named `getRecipes()`. This function will be responsible for retrieving the records stored in your Recipes's table. After creating this function you added a line of code to call it.

Inside the `getRecipes()` function, you used the `airtable` module to create a connection to the Airtable API, passed your API key as an argument and stored the object returned in a variable name `airtable`.

After establishing a connection with Airtable API, you connected to the Airtable Base and Recipes' table that you created in the previous section, by passing the base ID and table name to methods `airtable.base()` and `airtable.table()` respectively.

Once the connection to the Recipes' table was established, you used the `table.select().all()` method to retrieved all the records stored in the table.

You used the `forEach` loop to go through all the records and print the recipe's title for each record found.

Lastly, you added a line of code to call the `getRecipes()` function.


Go to your terminal, and use the following command to run the `recipes.js` file and see the recipes' titles printed on your rerminal:

```bash
npm start
```

You should see an output similar to this:

```text

```


## Using the Shotstack API to render videos

In this section, you will learn how to use the `shotstack-sdk` module to merge fields in a template and render videos.

The template that you are going to use generate videos can be downloaded in the following [link](). Download the file and store it in your project's root directory under the name `template.json`.

Here is an image taken from a video rendered with this template showing the what will change in in each video:

![image taken from a video rendered with a Shotstack using template](./media/showFields.jpg)

You will take the Date, Title, and Image fields of each record, merge it with the template and a render a video.

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

Here, first you required the `shotstack-sdk`, `fs`, and `dotenv` modules.

After requiring the modules, you created a function named `authenticate()`. This function will be responsible for establishing a connection to the Shotstack API. 

You started this function by creating a new Shotstack API client instance, and stored the object returned in a variable named `defaultClient`. Then, you set the client `basePath` property to `stage` to use the development sandbox.

You completed the authentication process by creating a Developer key object and setting this object `apiKey` property to your Shotstack stage API key.

Lastly, you added a line of code to call the `authenticate()` function.

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

Here, you created a function named `renderVideo()`. This function receives as an argument a record from the Recipes's table and renders a video.

You started this function by using the `fs` module to read the `template.json` file, and then parsed and stored this file's content in a variable named `template`.

After loading the template, you retrieved the video's timeline and output from the template and stored them in variables named `timeline` and `output` respectively.

You then, passed the record to a function named `getMergeFields()` and stored the value returned in a variable named `mergeFields`. The `getMergeFields()` as the name suggests will merge the record's fields with the template. You will create this function shortly.

After retrieving the `mergeFields`, you used the `shotstack-sdk` module to create a new Shotstack edit.

With the Shotstack edit created, you set the timeline to the value stored in `timeline`, the output to the value stored in `output`, and the merge to value stored in the `mergeFields`.

Lastly, you created a new Shotstack edit API object, called the `postRender()` method provided by this object and passed the Shotstack edit object to it as an argument to render the video. If the request to render the video is successful a render ID will be returned, but if it fails `undefined` will be returned instead. 


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

In the code above, you created the `getMergeFields()` function, that you called in the `renderVideo()` function. 

In this function you are using the `MergeField()` method provided by the `shotstack-sdk` to merge the `date`,`title`, and `image_url` fields found in the template with the `Date`,`Title`,and `Image` fields  found in the `record` that this function receives as an argument. 

After merging the fields you stored them in an array named `mergeFields` and returned the array.

Add the following code bellow the `getMergeFields()` function:

```js
let getRenderStatus = async (renderId) => {
  const api = new Shotstack.EditApi();
  let { response } = await api.getRender(renderId);
  return response;
};

module.exports = { renderVideo, getRenderStatus };
```

Here, first, you created a function named `getRenderStatus()`. This function receives as an argument a render ID and is responsible for polling the Shotstack API to find out a render status.

You started this function by creating a Shotstack edit API object and storing this object in a variable named `api`.

After creating the `api` object you called the `getRender()` method that this object provides and passed as an argument a render ID. Then, You stored the response returned by polling the Shotstack API in a variable named `response` and returned the variable.

Lastly, you exported the `renderVideo()` and `getRenderStatus()` functions.


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
  records.forEach(async (record) => {
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
