#!/usr/bin/env node
const sharp = require("sharp");
const fs = require("fs");

const outPath = __dirname+"/../empty_image.png";

async function run() {
  const buffer = await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .png()
  .toBuffer()

  await fs.promises.writeFile(outPath, buffer);
  console.log("Written to: '%s'", outPath);
}
run();
