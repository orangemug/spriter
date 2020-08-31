# spriter
**NOTE: This is a work in progress**

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

const fakeDatabase = {
  "acme": images,
};

function fakeApi (req) {
  const {namespace} = req.params;
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
spriter --db ./bin/sample/db.js --static ./example/public/images/
```

Which will expose the following URLS

```
http://localhost:8080/{namespace}/sprite@{pixel_ratio}x.png
http://localhost:8080/{namespace}/sprite@{pixel_ratio}x.json
```

So if you clone this repo and run

```
./bin/cli.js --db ./bin/sample/db.js --static ./example/public/images/
```

You can access the following URLs

 - <http://localhost:8080/acme/sprite@1x.png>
 - <http://localhost:8080/acme/sprite@1x.json>
 - <http://localhost:8080/acme/sprite@2x.png>
 - <http://localhost:8080/acme/sprite@2x.json>
 - <http://localhost:8080/facefriend/sprite@2x.json>
 - <http://localhost:8080/facefriend/sprite@2x.json>

As defined by [./bin/sample/db.js](./bin/sample/db.js).



## Development
Clone the repo and run

```bash
npm install
```

Start the example server with

```bash
npm run example
```

Where you have access to the following URLs

 - `http://localhost:3003/` - mapbox-gl-js example map
 - `http://localhost:3003/acme/sprite@2x.json` - the sprite JSON
 - `http://localhost:3003/acme/sprite@2x.png` - the sprite PNG

Note `@2x` can be replaced with any pixel ratio, for example `@1x`/`@3x`.

## Test
To test run

```bash
npm test
```

You can view code coverage results in your working directory at `./coverage/index.html`


## Memory optimization
This library uses [sharp](https://sharp.pixelplumbing.com/) under the hood. Using the standard memory allocator on a number of systems appears to use lots of memory, and sometimes doesn't release it. As described in <https://github.com/lovell/sharp/issues/955>, this can be resolved by using the `jemalloc` memory allocator, as described in that issue.

If you're on a Debian based system

```
apt-get update
apt-get install libjemalloc1
```

Then run the node process using the `jemalloc` memory allocator.

```
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1 npm run example
```

If you are still seeing issues you can also disable the sharp cache globally (see https://sharp.pixelplumbing.com/api-utility#cache). If you can using the spriter CLI you can disable that with `--no-cache` option, for example

```
spriter --no-cache --db ./bin/sample/db.js --static ./example/public/images/
```


## License
MIT

