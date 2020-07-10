# spriter
A really simple library for sprite generation.

Includes 

 - Express middleware
 - NodeJS API


## Usage
We create a definition of images we would like to serve, where the `width`/`height` is the output width/height of the image. Our library will scale the images during packing.

```javascript
const images = [
  {
    id: "red",
    url: "http://example.com/images/red.png",
    width: 20,
    height: 20
  },
  {
    id: "blue",
    url: "http://example.com/images/blue.jpg",
    width: 20,
    height: 20
  },
];
```

With the above definition we can either create server with the express middleware.

```javascript
const spriter = require("spriter");

function fakeApi (req) {
  const {namespace} = req.params;
  const fakeDatabase = {
    "acme": images,
  }
  return fakeDatabase[namespace];
}

app.use('/:namespace/sprite*', spriter.middleware(fakeApi, {
  // Default values...
  concurrency: 10,
  missingImageRetryInterval: 60,
}));
```

Or just run the process via the API
Via the API

```javascript
const {buffer, json} = spriter.convert(images);
```

Which is the same as

```javascript
const result = spriter.json(images);
const json = result.boxes;
const buffer = await spriter.png(result);
```

A full example using expressjs can be found at [./example/](/example).


## CLI
You can also run a CLI with

```
spriter --port 8080 --api "http://localhost:3006/{namespace}/images"
spriter --db cli/sample/db.js --static ./example/public/images/
```

Which will expose the following URLS

```
http://localhost:8080/{namespace}/sprite@{pixel_ratio}x.png
```

So if you clone this repo and run

```
./bin/cli.js --db cli/sample/db.js --static ./example/public/images/
```

You can access the following URLs

 - <http://localhost:8080/acme/sprite@1x.png>
 - <http://localhost:8080/acme/sprite@1x.json>
 - <http://localhost:8080/acme/sprite@2x.png>
 - <http://localhost:8080/acme/sprite@2x.json>
 - <http://localhost:8080/facefriend/sprite@2x.json>
 - <http://localhost:8080/facefriend/sprite@2x.json>

As defined by [./cli/sample/db.js](./cli/sample/db.js).



## Development
Clone the repo and run

```
npm install
```

Start the example server with

```
npm run example
```

Where you have access to the following URLs

 - `http://localhost:3003/` - mapbox-gl-js example map
 - `http://localhost:3003/acme/sprite@2x.json` - the sprite JSON
 - `http://localhost:3003/acme/sprite@2x.png` - the sprite PNG

Note `@2x` can be replaced with any pixel ratio, for example `@1x`/`@3x`.



## License
MIT

