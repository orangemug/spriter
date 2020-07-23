const spriter = require("../");
const express = require("express");


function promiseListen(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve({
          server: {
            ...server,
            url: (path) => {
              return `http://localhost:${server.address().port}/${path}`;
            },
            close: () => {
              return new Promise((resolve, reject) => {
                server.close(err => {
                  if (err) {
                    reject(err)
                  }
                  else {
                    resolve();
                  }
                })
              })
            }
          },
          port: server.address().port,
        });
      }
    });
  });
}

async function staticServer () {
  const app = express();
  app.use(express.static(__dirname+"/fixtures/"));
  return promiseListen(app);
};

async function appServer (handler) {
  const app = express();
  app.use("/sprite*", spriter.middleware(handler));
  // A simple error handler.
  app.use((err, req, res, next) => {
    if(err) {
      res.status(500).json({
        type: "error",
        data: err.toString(),
      })
    }
    else {
      next();
    }
  });
  return promiseListen(app);
};

module.exports = {
  staticServer,
  appServer,
}
