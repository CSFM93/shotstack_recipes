---
layout: layouts/blog.njk
title: How to use the Airtable API, the Shotstack API, and Javascript to build an automated video generator
name: How to build an automated video generator app
type: Content
description: Learn how to use the Airtable API, the Shotstack API, and Javascript to build an automated video generator app that uses a video template to generate multiple videos.
date: 2022-11-24
author: Carlos Mucuho
thumbnail: thumbnail.jpg
tags:
  - how to
  - learn
  - airtable
related:
  - How to use the templates endpoint
---


# How to use the Airtable API, the Shotstack API, and Javascript to build an automated video generator


### Introduction

In this tutorial, you are going to learn how to use the [Airtable API](https://airtable.com/), the [Shotstack API](https://shotstack.io/), and Javascript to create an automated video generator application that will use a video template to quickly generate multiple videos.

The [Shotstack API](https://dashboard.shotstack.io/register) is a cloud-based video editing API that lets you edit videos in the cloud through API endpoints.

The [Airtable API](https://airtable.com/developers/web/api/introduction) allows you to interact with your Airtable resources.

By the end of this tutorial you will have generated multiple videos that look like this:

<video width="640" height="360" controls>
 <source src="./assets/demo.mp4" type="video/mp4">
</video>


### Creating the project structure

In this section, you will create the directory where you will build the automated video generator, create a Node project, and install the required dependencies.

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

Use your preferred code editor to open the `package.json` file and change the `main` and `scripts` properties:

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

Here you changed the `main` and `scripts` properties. You have set the application main file to `recipes.js`. In the `scripts` property, you have added a script named `start`, which allows you to set the command that is supposed to run when you start the application. You will create the `recipes.js` file in the next section.

In your project's root directory, create a file named `.env`. In this `.env` file, you will store your Airtable Base ID and API key, and your Shotstack Stage ID and API key. The Airtable Base ID and API key will allow you to interact with your Airtable Base. The Shotstack Stage ID and API key will allow you to interact with Shotstack API and render videos.

Go back to your terminal, and run the following command to install this project's dependencies:

```bash
npm install shotstack-sdk airtable dotenv
```

With the command above you installed the following dependencies:
- `shotstack-sdk`: the Node SDK for Shotstack. You are going to use this SDK to render a video for each record found in your Airtable Base table.
- `airtable`: the official Airtable JavaScript library. You are going to use this library to retrieve and update records stored in your Airtable Base table.
- `dotenv`: a zero-dependency module that loads environment variables from a `.env` file into `process.env`. You are going to use this module to retrieve the Airtable and Shotstack keys that you will store in your `.env` file.


### Storing the recipes in Airtable and retrieving The Airtable and Shotstack API keys

In this section, you will learn how to store data in Airtable, and how to create and store the Airtable and Shotstack API keys.

#### Storing the Shotstack API key

Open your browser, navigate to [Shotstack's website](https://dashboard.shotstack.io/), and sign in to your account.

Navigate to the "Dashboard", then click on your username and select "API keys" in the dropdown menu:

![Manage Shotstack API keys](./assets/clickOnAPIKeys.jpg)

Copy the "Stage" API key and

![Copy the Shotstack Stage API Key](./assets/copyAPIKey.jpg)

Save the API key in your `.env` in a variable named `SHOTSTACK_STAGE_API_KEY`:

```.env
SHOTSTACK_STAGE_API_KEY="Your Shotstack stage API key"
```

#### Storing data in Airtable

Go back to your browser, and download the following [CSV file](./assets/recipes.csv) containing the sample data that you are going to use to populate your table.

The sample data that you are going to use in this tutorial is a Recipes table containing 31 records. Each record has a Date, Title, Image, and Video URL field.

After downloading the CSV file, navigate to [Airtable's website](https://airtable.com), and sign in to your account.

Click on "Start from scratch" to create a new Airtable base and name the base "Shotstack".

![Creating an Airtable table named Shotstack](./assets/createBase.jpg)

Inside the base named "Shotstack", create a new Airtable table named "Recipes". After creating the table, click on "Add or import", then click on "CSV file" and upload the CSV file you downloaded.

![Creating an Airtable table named Recipes](./assets/importCSV.jpg)

Your Recipes table should look like this:

![Airtable Recipes table](./assets/tablevisual.jpg)

Copy your [Airtable base ID](https://support.airtable.com/docs/understanding-airtable-ids) and save it in your `.env` in a variable named `AIRTABLE_BASE_ID`:

```.env
AIRTABLE_BASE_ID="Your Airtable base ID"
```

#### Creating and storing the Airtable API key

Still, on the Airtable website, click on "Account", and select "account" on the dropdown menu to navigate to your account page:

![Airtable navigate to account page](./assets/clickOnAccount.png)

Scroll down to the "API" section, and click on the "Generate API Key" button to create a new API key :

![Creating Airtable API key ](./assets/createAPIKey.jpg)

Copy your Airtable API key and save it in your `.env` in a variable named `AIRTABLE_API_KEY`:

```.env
AIRTABLE_API_KEY="Your Airtable API key"
```

Your `.env` file should look similar to this:

```.env
SHOTSTACK_STAGE_API_KEY="Your Shotstack stage API key"
AIRTABLE_BASE_ID="Your Airtable base ID"
AIRTABLE_API_KEY="Your Airtable API key"
```


### Retrieving the records stored in Airtable

In this section, you will learn how to use the `airtable` module to retrieve the records stored in your Recipes table.

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

In the block of code above, first, you required the `airtable` and `dotenv` modules.

Bellow the require statements, you created a function named `getRecipes()`. This function will be responsible for retrieving the records stored in your Recipes table. After creating this function you added a line of code to call it.

Inside the `getRecipes()` function, you used the `airtable` module to connect to the Airtable API, passed your API key as an argument, and stored the object returned in a variable name `airtable`.

After establishing a connection with Airtable API, you connected to the Airtable Base and Recipes table that you created in the previous section, by passing the base ID and table name to methods `airtable.base()` and `airtable.table()`.

Once the connection to the Recipes table was established, you used the `table.select().all()` method to retrieve all the records stored in the table.

You used the `forEach` loop to go through all the records and print the recipe's title for each record found.

Lastly, you added a line of code to call the `getRecipes()` function.

Go to your terminal, and use the following command to run the `recipes.js` file and see the recipes' titles printed on your terminal:

```bash
npm start
```

You should see an output similar to this:

```text
recipe Honey Mustard Pork Chops With Capers & Mustard Greens
recipe Chinese Fried Rice
recipe Simple Pasta Toss
recipe Sheet Pan Buffalo Cauliflower With Roasted Chickpeas & Kale
recipe Baked Shrimp & Orzo With Chickpeas, Lemon & Dill
recipe Stuffed Pork Chops
recipe Baked Pollock
recipe Quick Weeknight Pizza With Ricotta, Broccolini & Sausage
. . .
```

### Using the Shotstack API to render videos

In this section, you will learn how to use the `shotstack-sdk` module to merge fields in a template and render videos.

The template that you are going to use to generate videos can be downloaded in the following [link](./assets/template.json). Download the file and store it in your project's root directory under the name `template.json`.

Here is an image taken from a video rendered with this template showing what will change in each video:

![image taken from a video rendered with Shotstack using template](./assets/showFields.jpg)

You will take the Date, Title, and Image fields of each record, merge them with the template and render a video.

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

Here, first, you required the `shotstack-sdk`, `fs`, and `dotenv` modules.

After requiring the modules, you created a function named `authenticate()`. This function will be responsible for establishing a connection to the Shotstack API.

You started this function by creating a new Shotstack API client instance and storing the object returned in a variable named `defaultClient`. Then, you set the client `basePath` property to `stage` to use the development sandbox.

You completed the authentication process by creating a Developer key object and setting this object's `apiKey` property to your Shotstack stage API key.

Lastly, you added a line of code to call the `authenticate()` function.

Add the following code below the `authenticate()` function.

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

You then passed the record to a function named `getMergeFields()` and stored the value returned in a variable named `mergeFields`. The `getMergeFields()` as the name suggests will merge the record's fields with the template. You will create this function shortly.

After retrieving the `mergeFields`, you used the `shotstack-sdk` module to create a new Shotstack edit.

With the Shotstack edit created, you set the timeline to the value stored in `timeline`, the output to the value stored in `output`, and the merge to the value stored in the `mergeFields`.

Lastly, you created a new Shotstack edit API object, called the `postRender()` method provided by this object, and passed the Shotstack edit object to it as an argument to render the video. If the request to render the video is successful a render ID will be returned, but if it fails `undefined` will be returned instead.

Add the following code below the `renderVideo()` function:

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

In the code above, you created the `getMergeFields()` function, which you called in the `renderVideo()` function.

In this function you are using the `MergeField()` method provided by the `shotstack-sdk` to merge the `date`, `title`, and `image_url` fields found in the template with the `Date`, `Title`, and `Image` fields found in the `record` that this function receives as an argument.

After merging the fields you stored them in an array named `mergeFields` and returned the array.

Add the following code below the `getMergeFields()` function:

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


### Updating the records stored in Airtable

In this section, you will import the functions you exported in the previous section to render a video for each record found in the Recipes's table, and then you will create a function to update the record's Video URL field.

Go to the top of your `recipes.js` file and add the following line of code to it:

```js
const { renderVideo, getRenderStatus } = require("./videoGenerator");
```

In the line above, you required the `renderVideo()` and `getRenderStatus()` functions.

Add the following function below the `getRecipes()` function:

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

Here, you created a function named `getVideoURL()`. This function will be responsible for calling the `getRenderStatus()` function every 3 seconds and checking if the video rendering is finished by checking if the `response.status` is equal to `done`. Once the video rendering finishes the video url will be retrieved from the `response`, stored in a variable named `url`, and then returned.

Add the following function below the `getVideoURL()` function:

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

In the block of code above, you created a function named `updateVideoURLField()`. This function takes as arguments the Recipes' table object, a record ID, and a video URL.

This function is responsible for adding a video URL to a record by using the `table.update()` method.

If the record is successfully updated a message containing the record's title will be shown in the terminal but if an error occurs then the error will be shown in the terminal instead.

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

Here, you updated your `getRecipes()` function. Now, for each record found in the Recipes table, you called the `renderVideo()` function, passed the record as an argument, and stored the value returned in a variable named `renderId`.

After retrieving the render ID, you checked if the `renderId` is equal to `undefined`. If it is not `undefined`, you called the `getVideoURL()` function, passed the video render id as an argument, and stored the value returned in a variable named `videoURL`.

After retrieving the video URL, you called the `updateVideoURLField()` function and passed the Recipes' table object, the record ID, and the video URL as arguments.

Go back to your terminal, and use the following command to run your application:

```bash
npm start
```

You should see an output similar to this:

```text

```

If your output looks like the one above, it means that your application is running as it should.

Open your browser, navigate to [Airtable's website](https://airtable.com), select the base containing your Recipes table and watch the Video URL field update.

![Video URL field being updated after Shotstack finishes rendering]()


### Conclusion

In this tutorial, first, you learned how to use the Airtable API to retrieve all records stored in a table. You then learned how to use the Shotstack API to merge a record's fields with a template and render a video. Lastly, you learned how to retrieve the rendered video URL and put it in a record's Video URL field.

For more information on how to use these APIs please read the [Airtable API Documentation](https://airtable.com/developers/web/api/introduction) and the [Shotstack API documentation](https://shotstack.io/docs/api/#shotstack).
