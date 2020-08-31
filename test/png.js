const assert = require("assert");
const spriter = require("../");
const fs = require("fs");
const helper = require("./helper");


describe("png", () => {
  let port;
  let server;

  before(async () => {
    const result = await helper.staticServer();
    port = result.port;
    server = result.server;
  });

  after(async () => {
    await server.close();
  });

  it("no options", async () => {
    const imgs = [
      {
        "id": "foo",
        "url": `http://localhost:${port}/red.svg`,
        "width": 30,
        "height": 80,
      },
      {
        "id": "bar",
        "url": `http://localhost:${port}/blue.png`,
        "width": 30,
        "width": 50,
        "height": 40,
      },
    ];

    const json = spriter.json(imgs);
    const {buffer, missingImages} = await spriter.png(json);
    assert.deepStrictEqual(missingImages, []);
    const resultBuffer = await fs.promises.readFile(__dirname+"/results/no_pixel_ratio.png");
    assert(
      buffer.equals(resultBuffer)
    );
  });

  it("pixel ratio", async () => {
    const imgs = [
      {
        "id": "foo",
        "url": `http://localhost:${port}/red.svg`,
        "width": 30,
        "height": 80,
      },
      {
        "id": "bar",
        "url": `http://localhost:${port}/blue.png`,
        "width": 30,
        "width": 50,
        "height": 40,
      },
    ];

    const json = spriter.json(imgs, {pixelRatio: 2});
    const {buffer, missingImages} = await spriter.png(json);
    assert.deepStrictEqual(missingImages, []);
    const resultBuffer = await fs.promises.readFile(__dirname+"/results/pixel_ratio.png");
    assert(
      buffer.equals(resultBuffer)
    );
  });

  it("missing images", async () => {
    const imgs = [
      {
        "id": "missing_id",
        "url": `http://localhost:${port}/missing.svg`,
        "width": 60,
        "height": 60,
      },
      {
        "id": "foo",
        "url": `http://localhost:${port}/red.svg`,
        "width": 30,
        "height": 80,
      },
      {
        "id": "bar",
        "url": `http://localhost:${port}/blue.png`,
        "width": 30,
        "width": 50,
        "height": 40,
      },
    ];

    const json = spriter.json(imgs);
    let err;
    const {buffer, missingImages} = await spriter.png(json);
    const resultBuffer = await fs.promises.readFile(__dirname+"/results/missing_img.png");

    assert.deepStrictEqual(missingImages, ["missing_id"]);
    assert(
      buffer.equals(resultBuffer)
    );
  });

  it("rounded dimensions", async () => {
    const imgs = [
      {
        "id": "foo",
        "url": `http://localhost:${port}/red.svg`,
        "width": 30.4,
        "height": 80.4,
      },
      {
        "id": "bar",
        "url": `http://localhost:${port}/blue.png`,
        "width": 49.9,
        "height": 39.9,
      },
    ];

    const json = spriter.json(imgs);
    const {buffer, missingImages} = await spriter.png(json);
    assert.deepStrictEqual(missingImages, []);
    const resultBuffer = await fs.promises.readFile(__dirname+"/results/no_pixel_ratio.png");
    assert(
      buffer.equals(resultBuffer)
    );
  });
});


