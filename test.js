import fetch from "node-fetch";
import fs from "fs";
import { performance } from "perf_hooks";
import cheerio from "cheerio";
import { default as hypertag } from "hypertag";
import { createRequire } from "module";
import fastHtmlParser from "fast-html-parser";
import nodeHtmlParser from "node-html-parser";
import parse5 from "parse5";
import { SaxEventType, SAXParser } from "sax-wasm";

const require = createRequire(import.meta.url);

const ITERATIONS = 1000;

async function test() {
  // fetch GitHub.com homepage (© GitHub, all rights reserved)
  const html = await fetch("https://github.com/home").then((res) => res.text());
  const htmlBuf = Buffer.from(html);
  const timers = {};

  // hypertag
  timers.hypertag = { start: performance.now() };
  for (let n = 0; n < ITERATIONS; n++) {
    hypertag(html, "svg");
  }
  timers.hypertag.end = performance.now();

  console.log(new Array(40).join("-"));
  print("hypertag", timers.hypertag.start, timers.hypertag.end);

  // fast-html-parser
  timers["fast-html-parser"] = { start: performance.now() };
  for (let n = 0; n < ITERATIONS; n++) {
    const fastHtmlDoc = fastHtmlParser.parse(html);
    fastHtmlDoc.querySelector("svg");
  }
  timers["fast-html-parser"].end = performance.now();
  print(
    "fast-html-parser",
    timers["fast-html-parser"].start,
    timers["fast-html-parser"].end
  );

  // node-html-parser
  timers["node-html-parser"] = { start: performance.now() };
  for (let n = 0; n < ITERATIONS; n++) {
    const nodeHtmlDoc = nodeHtmlParser.parse(html);
    nodeHtmlDoc.querySelector("svg");
  }
  timers["node-html-parser"].end = performance.now();
  print(
    "node-html-parser",
    timers["node-html-parser"].start,
    timers["node-html-parser"].end
  );

  // sax-wasm
  timers["sax-wasm"] = { start: performance.now() };
  for (let n = 0; n < ITERATIONS; n++) {
    // 🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️
    const options = { highWaterMark: 32 * 1024 };
    const parser = new SAXParser(
      SaxEventType.Attribute | SaxEventType.OpenTag,
      options
    );
    parser.eventHandler = (event, data) => {
      if (event === SaxEventType.OpenTag) {
        const svgData = data;
      }
    };
    await parser.prepareWasm(
      fs.readFileSync(require.resolve("sax-wasm/lib/sax-wasm.wasm"))
    );
    parser.write(htmlBuf);
    parser.end();
  }
  timers["sax-wasm"].end = performance.now();
  print("sax-wasm", timers["sax-wasm"].start, timers["sax-wasm"].end);

  // cheerio
  timers.cheerio = { start: performance.now() };
  for (let n = 0; n < ITERATIONS; n++) {
    const cheerioDoc = cheerio.load(html);
    cheerioDoc("svg");
  }
  timers.cheerio.end = performance.now();
  print("parse5", timers.cheerio.start, timers.cheerio.end);

  // parse5
  timers.parse5 = { start: performance.now() };
  for (let n = 0; n < ITERATIONS; n++) {
    const parse5doc = parse5.parse(html);
    JSON.stringify(parse5doc.childNodes, (k, v) => {
      delete v.parentNode;
      const isSvg = k === "tagName" && v === "svg";
      return v;
    });
  }
  timers.parse5.end = performance.now();
  print("parse5", timers.parse5.start, timers.parse5.end);
  console.log(new Array(40).join("-"));
}
test();

function padRight(input, min = 20) {
  let output = input;
  while (output.length < min) {
    output += " ";
  }
  return output;
}

function padLeft(input, min = 20) {
  let output = input;
  while (output.length < min) {
    output = " " + output;
  }
  return output;
}

function print(row, start, end) {
  console.log(
    `| ${padRight(row)} | ${padLeft((end - start).toFixed(2), 10)}ms |`
  );
}
