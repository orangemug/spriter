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
  concurrency: 10 /* default value */
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


## License
MIT

