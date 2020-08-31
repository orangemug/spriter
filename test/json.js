const assert = require("assert");
const spriter = require("../");

describe("json", () => {
  it("no options", async () => {
    const imgs = [
      {
        "id": "foo",
        "url": "http://example.com/foo.png",
        "width": 30,
        "height": 80,
      },
      {
        "id": "bar",
        "url": "http://example.com/bar.png",
        "width": 50,
        "height": 40,
      },
    ];

    const result = spriter.json(imgs);

    assert.deepStrictEqual(result, {
      width: 50,
      height: 120,
      images: [
        {
          id: 'foo',
          url: 'http://example.com/foo.png',
          width: 30,
          height: 80,
          x: 0,
          y: 0
        },
        {
          id: 'bar',
          url: 'http://example.com/bar.png',
          width: 50,
          height: 40,
          x: 0,
          y: 80
        }
      ],
      boxes: {
        foo: { pixelRatio: 1, width: 30, height: 80, x: 0, y: 0 },
        bar: { pixelRatio: 1, width: 50, height: 40, x: 0, y: 80 }
      },
      pixelRatio: 1
    });
  });

  it("pixel ratio", () => {
    const imgs = [
      {
        "id": "foo",
        "url": "http://example.com/foo.png",
        "width": 30,
        "height": 80,
      },
      {
        "id": "bar",
        "url": "http://example.com/bar.png",
        "width": 50,
        "height": 40,
      },
    ];

    const result = spriter.json(imgs, {pixelRatio: 2});

    assert.deepStrictEqual(result, {
      width: 100,
      height: 240,
      images: [
        {
          id: 'foo',
          url: 'http://example.com/foo.png',
          width: 30,
          height: 80,
          x: 0,
          y: 0
        },
        {
          id: 'bar',
          url: 'http://example.com/bar.png',
          width: 50,
          height: 40,
          x: 0,
          y: 80
        }
      ],
      boxes: {
        foo: { pixelRatio: 2, width: 60, height: 160, x: 0, y: 0 },
        bar: { pixelRatio: 2, width: 100, height: 80, x: 0, y: 160 }
      },
      pixelRatio: 2
    });
  });

  it("rounded dimensions", async () => {
    const imgs = [
      {
        "id": "foo",
        "url": "http://example.com/foo.png",
        "width": 30.4,
        "height": 80.4,
      },
      {
        "id": "bar",
        "url": "http://example.com/bar.png",
        "width": 49.9,
        "height": 39.9,
      },
    ];

    const result = spriter.json(imgs);

    assert.deepStrictEqual(result, {
      width: 50,
      height: 120,
      images: [
        {
          id: 'foo',
          url: 'http://example.com/foo.png',
          width: 30,
          height: 80,
          x: 0,
          y: 0
        },
        {
          id: 'bar',
          url: 'http://example.com/bar.png',
          width: 50,
          height: 40,
          x: 0,
          y: 80
        }
      ],
      boxes: {
        foo: { pixelRatio: 1, width: 30, height: 80, x: 0, y: 0 },
        bar: { pixelRatio: 1, width: 50, height: 40, x: 0, y: 80 }
      },
      pixelRatio: 1
    });
  });
});

