const db = {
  "acme": [
    {"id": "red", "url": "{base_url}/images/red.jpg", "width": 20, "height": 20},
    {"id": "green", "url": "{base_url}/images/green.svg", "width": 32, "height": 32},
    {"id": "blue", "url": "{base_url}/images/blue.png", "width": 20, "height": 20}
  ],
  "facefriend": [
    {"id": "red", "url": "{base_url}/images/red.jpg", "width": 20, "height": 20},
    {"id": "blue", "url": "{base_url}/images/blue.png", "width": 20, "height": 20}
  ]
}

function get (namespace, host) {
  return db[namespace];
}

module.exports = {get};
