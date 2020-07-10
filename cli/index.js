#!/usr/bin/env node
const express = require("express");
const spriter = require("../");
const app = express();
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));

const cmd = path.relative(process.cwd(), process.argv[1]);
const helpText = `
${cmd} - start spriter

Options, specify either 'api' or 'db' (not both)

  --api       URL to an API server
  --db        A module that provides a 'get' method
  --static    Directory to start as a static file server
  --port      HTTP server port

Examples

  ${cmd} --port 8080 --api "http://example.com/images/{namespace}"
  ${cmd} --port 8080 --db ./db.js --static ./images
`

if (argv.h || argv.help) {
  console.warn(helpText);
  process.exit(1);
}

const staticDir = argv.static;
let dbPath;
const apiUrl = argv.api;
const port = argv.port || process.env.PORT || 8080;

if (argv.db) {
  dbPath = process.cwd()+"/"+argv.db
  try {
    require.resolve(dbPath);
  }
  catch (err) {
    console.error("Error: Failed to load: '%s'", dbPath);
    console.error(helpText);
    process.exit(1);
  }
}

if (!apiUrl && !dbPath) {
  console.error(helpText);
  process.exit(1);
}

let apiResolver;
if (apiUrl) {
  apiResolver = async (req) => {
    const {namespace} = req.params.namespace;
    const url = apiUrl.replace("{namespace}", namespace);
    const resp = await fetch(url);
    return await resp.json();
  }
}
else if (dbPath) {
  const db = require(dbPath);
  apiResolver = (req) => {
    const baseUrl = req.protocol+"://"+(req.headers["x-forwarded-host"] || req.headers.host);
    const images = db.get(req.params.namespace);
    const out =  images.map(img => {
      return {
        ...img,
        url: img.url.replace("{base_url}", baseUrl)
      }
    })
    return out;
  }
}

if (staticDir) {
  app.use("/images", express.static(process.cwd()+"/"+staticDir));
}

app.use('/:namespace/sprite*', spriter.middleware(apiResolver));

app.listen(port, (err) => {
  if (err) {
    console.error(err)
    process.exit(1);
  }
  else {
    console.log("Started at: <http://localhost:%s>", port);
  }
})

