const assert = require("assert");
const spriter = require("../");
const fs = require("fs");
const helper = require("./helper");
const fetch = require("node-fetch");
const genEtag = require('etag');


describe("middleware", () => {
  let staticPort;
  let staticServer;
  let testServer;

  before(async () => {
    const staticRes = await helper.staticServer();
    staticPort = staticRes.port;
    staticServer = staticRes.server;
  });

  after(async () => {
    await staticServer.close();
  });

  async function startServer (fn) {
    const {server} = await helper.appServer(fn);
    testServer = server;
  }

  afterEach(async () => {
    if (testServer) {
      const promise = testServer.close();
      testServer = undefined;
      await promise;
    }
  });

  it("@1x.json", async () => {
    await startServer(() => {
      return [
        {
          "id": "foo",
          "url": `http://localhost:${staticPort}/red.svg`,
          "width": 30,
          "height": 80,
        },
        {
          "id": "bar",
          "url": `http://localhost:${staticPort}/blue.png`,
          "width": 30,
          "width": 50,
          "height": 40,
        },
      ];
    })

    const res = await fetch(testServer.url("sprite@1x.json"));
    assert.equal(res.status, 200);
    assert.deepStrictEqual(await res.json(), {
      "bar": {
        "height": 40,
        "pixelRatio": 1,
        "width": 50,
        "x": 0,
        "y": 80
      },
      "foo": {
        "height": 80,
        "pixelRatio": 1,
        "width": 30,
        "x": 0,
        "y": 0
      }
    });
    assert.equal(
      res.headers.get("etag"),
      '"76-wPlk3ModHWwF8oWlTqXfSCVISAY"'
    );

    assert.deepStrictEqual(
      res.headers.get("content-type"),
      "text/json; charset=utf-8"
    );
  });

  it("@2x.json", async () => {
    await startServer(() => {
      return [
        {
          "id": "foo",
          "url": `http://localhost:${staticPort}/red.svg`,
          "width": 30,
          "height": 80,
        },
        {
          "id": "bar",
          "url": `http://localhost:${staticPort}/blue.png`,
          "width": 30,
          "width": 50,
          "height": 40,
        },
      ];
    })

    const res = await fetch(testServer.url("sprite@2x.json"));
    assert.equal(res.status, 200);
    assert.deepStrictEqual(await res.json(), {
      "bar": {
        "height": 80,
        "pixelRatio": 2,
        "width": 100,
        "x": 0,
        "y": 160
      },
      "foo": {
        "height": 160,
        "pixelRatio": 2,
        "width": 60,
        "x": 0,
        "y": 0
      }
    });
    assert.equal(
      res.headers.get("etag"),
      '"79-2K152AVhvHY/1oSjAqoPtDIGSvc"'
    );

    assert.deepStrictEqual(
      res.headers.get("content-type"),
      "text/json; charset=utf-8"
    );
  });

  it("@1x.png", async () => {
    await startServer(() => {
      return [
        {
          "id": "foo",
          "url": `http://localhost:${staticPort}/red.svg`,
          "width": 30,
          "height": 80,
        },
        {
          "id": "bar",
          "url": `http://localhost:${staticPort}/blue.png`,
          "width": 30,
          "width": 50,
          "height": 40,
        },
      ];
    })

    const resultBuffer = await fs.promises.readFile(__dirname+"/results/no_pixel_ratio.png");
    const res = await fetch(testServer.url("sprite@1x.png"));
    const buffer = await res.buffer();
    assert(resultBuffer.equals(buffer));
    assert.equal(
      res.headers.get("etag"),
      // Hash of JSON
      '"76-wPlk3ModHWwF8oWlTqXfSCVISAY"'
    );

    assert.equal(
      res.headers.get("cache-control"),
      undefined,
    );

    const cacheRes = await fetch(testServer.url("sprite@1x.png"), {
      headers: {
        'if-none-match': res.headers.get("etag"),
      }
    });
    assert.equal(cacheRes.status, 304);
  });

  it("@2x.png", async () => {
    await startServer(() => {
      return [
        {
          "id": "foo",
          "url": `http://localhost:${staticPort}/red.svg`,
          "width": 30,
          "height": 80,
        },
        {
          "id": "bar",
          "url": `http://localhost:${staticPort}/blue.png`,
          "width": 30,
          "width": 50,
          "height": 40,
        },
      ];
    })

    const resultBuffer = await fs.promises.readFile(__dirname+"/results/pixel_ratio.png");
    const res = await fetch(testServer.url("sprite@2x.png"));
    const buffer = await res.buffer();
    assert(resultBuffer.equals(buffer));
    assert.equal(
      res.headers.get("etag"),
      // Hash of JSON
      '"79-2K152AVhvHY/1oSjAqoPtDIGSvc"'
    );

    assert.equal(
      res.headers.get("cache-control"),
      undefined,
    );

    const cacheRes = await fetch(testServer.url("sprite@2x.png"), {
      headers: {
        'if-none-match': res.headers.get("etag"),
      }
    });
    assert.equal(cacheRes.status, 304);
  });

  it("invalid path in request", async () => {
    await startServer(() => {
      return [];
    });

    const res = await fetch(testServer.url("foo@2x.json"));
    assert.equal(res.status, 404);
  });

  it("missing img", async () => {
    await startServer(() => {
      return [
        {
          "id": "missing_id",
          "url": `http://localhost:${staticPort}/missing.svg`,
          "width": 60,
          "height": 60,
        },
        {
          "id": "foo",
          "url": `http://localhost:${staticPort}/red.svg`,
          "width": 30,
          "height": 80,
        },
        {
          "id": "bar",
          "url": `http://localhost:${staticPort}/blue.png`,
          "width": 30,
          "width": 50,
          "height": 40,
        },
      ];
    })

    const resultBuffer = await fs.promises.readFile(__dirname+"/results/missing_img.png");
    const res = await fetch(testServer.url("sprite@1x.png"));
    assert.equal(
      res.headers.get("etag"),
      genEtag(resultBuffer)
    );

    assert.equal(
      res.headers.get("cache-control"),
      'public, max-age=60',
    );
  });

  it("missing data", async () => {
    await startServer(() => {
      return null;
    })

    const res = await fetch(testServer.url("sprite@1x.png"));
    assert.equal(res.status, 404);
  });

  it("invalid path", async () => {
    await startServer(() => {
      return [];
    })

    const requestUrls = [
      testServer.url("sprite_foobar"),
      testServer.url("sprite.json"),
      testServer.url("sprite.png"),
    ];

    for (let url of requestUrls) {
      const response = await fetch(url);
      assert.equal(response.status, 500);

      // The format will be from your own error handler.
      // See `./test/helper.js` appServer function
      assert.deepStrictEqual(await response.json(), {
        type: "error",
        data: "Error: Expected URL to have suffix of format /(@[0.9]+x)?.(png|json)/"
      });
    }
  });
});
