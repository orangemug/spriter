const express = require("express");
const spriter = require("../");
const app = express();
const fs = require("fs");

const port = process.env.PORT || 8080

// Where the images live
app.use(express.static(__dirname+'/public'));

/**
 * Just a fake API, replace this with an actual connector to your API.
 *
 * Note all images MUST have a width/height that must be an aspect ratio of the
 * actual image.
 */
async function fakeApi (req) {
  const buffer = await fs.promises.readFile(__dirname+"/db.json");
  const fakeDb = JSON.parse(buffer.toString());
  Object.entries(fakeDb).forEach(([k,v]) => {
    v.forEach(def => def.url = `http://localhost:${port}/${def.url}`);
  });
  return fakeDb[req.params.namespace];
}

app.use('/:namespace/sprite*', spriter.middleware(fakeApi, {
  concurrency: 10 /* default value */
}));

app.listen(port);

