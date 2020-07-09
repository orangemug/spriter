const express = require("express");
const spriter = require("../");
const app = express();

const port = process.env.PORT || 8080

// Where the images live
app.use(express.static(__dirname+'/public'));

function fakeApi (req) {
  // This will most likely be from an API.
  const local = (path) => (`http://localhost:${port}/${path}`);
  const fakeDatabase = {
    "acme": [
      {id: "red", url: local("/images/red.png"), width: 20, height: 20},
      {id: "green", url: local("images/green.svg"), width: 40, height: 40},
      {id: "blue", url: local("/images/blue.jpg"), width: 20, height: 20},
    ],
    "facefriend": [
      {id: "red", url: local("/images/red.png"), width: 20, height: 20},
      {id: "blue", url: local("/images/blue.jpg"), width: 20, height: 20},
    ]
  }
  console.log(req.params.namespace);
  return fakeDatabase[req.params.namespace];
}

app.use('/:namespace/sprite*', spriter.middleware(fakeApi, {
  concurrency: 10 /* default value */
}));

app.listen(port);

