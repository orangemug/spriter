# spriter
A really simple library for sprite generation.

Includes 

 - Express middleware
 - NodeJS API


## Usage

```javascript
const spriter = require("spriter");

app.use('/:namespace/sprite*', spriter.middleware(fakeApi, {
  concurrency: 10 /* default value */
}));
```

Via the API

```javascript
const images = [
  {id: "red", url: "http://example.com/images/red.png", width: 20, height: 20},
  // We can read from a buffer also...
  {id: "blue", buffer: fs.readFileSync("demo.png"), width: 20, height: 20},
  {id: "blue", url: "http://example.com/images/blue.jpg", width: 20, height: 20},
];
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

