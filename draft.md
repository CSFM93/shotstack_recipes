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
- `dotenv`: a zero-dependency module that loads environment variables from a `.env` file into  `process.env`. You are going to use this module to retrieve the Airtable and Shotstack keys that you will store in your `.env` file.


## Storing the recipes in Airtable and retrieving The Airtable and Shotstack API keys



## Retrieving the records stored in Airtable



## Using the Shotstack API to render videos



## Updating the records stored in Airtable



## Conclusion