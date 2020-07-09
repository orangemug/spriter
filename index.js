const ShelfPack = require('@mapbox/shelf-pack');
const mapnik = require('mapnik');
const genEtag = require('etag');
const fresh = require('fresh');
const pLimit = require('p-limit');
const fetch = require('node-fetch');


const EMPTY_PNG = new mapnik.Image(1, 1).encodeSync('png');

function qsToggle (qs, k) {
  const valid = ["", "true", "1"]
  return valid.includes(qs[k]);
}

function json (imgs, {pixelRatio}) {
  const sprite = new ShelfPack(1, 1, { autoResize: true });
  const results = sprite.pack(imgs, { inPlace: true });

  const out = {};
  results.forEach(item => {
    out[item.id] = {
      "pixelRatio": pixelRatio,
      "width": item.w*pixelRatio,
      "height": item.h*pixelRatio,
      "x": item.x*pixelRatio,
      "y": item.y*pixelRatio,
    };
  })
  return {
    width: sprite.w*pixelRatio,
    height: sprite.h*pixelRatio,
    images: imgs,
    boxes: out,
    pixelRatio,
  };
}

async function png (spriteJson) {
  const {pixelRatio, boxes, images, width, height} = spriteJson;
  function insertImageUrl (def) {
    const img = boxes[def.id];
    return {
      ...def,
      ...img,
    };
  }

  const imgs = await fetchImages(
    images.map(insertImageUrl)
  );

  if (!imgs.length) {
    return EMPTY_PNG;
  }

  return new Promise((resolve, reject) => {
    function callback (err, data) {
      if (err) {
        console.warn(err);
        reject(err);
      }
      else {
        resolve(data);
      }
    }
    mapnik.blend(imgs, {
      type: "png",
      width,
      height,
    }, callback);
  });
}

async function fetchImage (imgDef) {
  const resizeOpts = {
    // TODO: Make this configurable.
    scaling_method: mapnik.imageScaling.near
  };
  try {
    const resp = await fetch(imgDef.url);
    const {status} = resp;
    if (status < 200 || status >= 300) {
      console.warn("Not found: '%s'", imgDef.url);
      return {
        ...imgDef,
        buffer: EMPTY_PNG,
      }
    }
    if (imgDef.buffer) {
      return imgDef;
    }
    else if (imgDef.url.match(/\.svg$/i)) {
      const svgBuffer = await resp.buffer();
      const mapnikOpts = { scale: imgDef.pixelRatio };
      const buffer = await (new Promise((resolve, reject) => {
        mapnik.Image.fromSVGBytes(svgBuffer, mapnikOpts, (err, image) => {
          if (err) {
            reject(err);
          }
          image.resize(imgDef.width, imgDef.height, resizeOpts, (err, data) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(data)
            }
          })
        });
      }));

      return {
        ...imgDef,
        buffer,
      };
    }
    else {
      const inBuffer = await resp.buffer();

      const buffer = await (new Promise((resolve, reject) => {
        mapnik.Image.fromBytes(inBuffer, (err, image) => {
          if (err) {
            reject(err);
          }
          image.resize(imgDef.width, imgDef.height, resizeOpts, (err, data) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(data)
            }
          })
        })
      }))
      return {
        ...imgDef,
        buffer,
      };
    }
  }
  catch (_err) {
    console.warn(_err);
    return {
      ...imgDef,
      buffer: EMPTY_PNG,
    };
  }
}

async function fetchImages (imgs, opts, res) {
  opts = {
    ...opts,
    concurrency: 10
  };
  const limit = pLimit(opts.concurrency);

  const promises = imgs.map(img => {
    return limit(() => fetchImage(img));
  });

  const out = await Promise.all(promises);
  return out;
}

async function convert(imgs) {
  const outJson = json(imgs);
  const outPngBuffer = await png(outJson);
  return {
    json: outJson.boxes,
    buffer: outPngBuffer,
  };
}

function middleware (resolver) {
  return async function (req, res, next) {
    try {
      const imgs = await resolver(req);
      if (!imgs) {
        res.status(404).end();
        return;
      }

      const urlMatches = req.baseUrl.match(/(?:@([0-9]+)x)?\.(png|json)$/);
      if (!urlMatches) {
        throw new Error("Expected URL to have suffix of format /(@[0.9]+x)?\.(png|json)/")
      }

      const debugging = qsToggle(req.query, "debug");
      const pixelRatio = parseInt(urlMatches[1], 10);
      const format = urlMatches[2];

      const spriteJson = json(imgs, {pixelRatio});
      const apiResp = JSON.stringify(spriteJson.boxes, null, debugging ? 2 : 0);

      const etag = genEtag(apiResp);
      res.setHeader("etag", etag);

      // Etag check because it's cheap here and we don't have to do any JSON processing.
      if (fresh(req.headers, {etag})) {
        // Just use the browser/cdn cache.
        res.status(304).end();
        return;
      }

      if (format === "json") {
        res.setHeader("content-type", "text/json");
        res.send(apiResp);
        return;
      }
      else if (format === "png") {
        const buffer = await png(spriteJson);
        res.setHeader("content-type", "image/png");
        res.send(buffer).end();
      }
      else {
        throw new Error("Unexpected error");
      }
    }
    catch(err) {
      next(err);
      return;
    }
  }
}

module.exports = {
  middleware,
  png,
  json,
};
