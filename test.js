import fetch from "node-fetch";
import fs from "fs";
import { performance } from "perf_hooks";
import cheerio from "cheerio";
import { default as hypertag } from "hypertag";
import { createRequire } from "module";
import fastHtmlParser from "fast-html-parser";
import { default as fastHtmlDomParser } from "fast-html-dom-parser";
import nodeHtmlParser from "node-html-parser";
import { JSDOM } from "jsdom";
import htmlparser2 from "htmlparser2";
import { SaxEventType, SAXParser } from "sax-wasm";

const require = createRequire(import.meta.url);

const ITERATIONS = 1000;

async function main() {
  // fetch GitHub.com homepage (© GitHub, all rights reserved)
  const html = await fetch("https://github.com/home").then((res) => res.text());
  const htmlBuf = Buffer.from(html);

  // note: Tests must run one after the other! Benchmarks are no good running in parallel

  // start
  console.log(new Array(40).join("-"));

  // htmlparser2
  await test("htmlparser2", async () => {
    const parser = new htmlparser2.Parser({
      onopentag(name, attrs) {
        if (name === "svg") {
          // found it!
        }
      },
      onclosetag(name, attrs) {
        if (name === "svg") {
          // found it!
        }
      },
    });
    parser.write(html);
    parser.end();
  });

  // hypertag
  await test("hypertag", async () => {
    hypertag(html, "svg");
  });

  // fast-html-parser
  await test("fast-html-parser", async () => {
    const fastHtmlDoc = fastHtmlParser.parse(html);
    fastHtmlDoc.querySelector("svg");
  });

  // node-html-parser
  await test("node-html-parser", async () => {
    const nodeHtmlDoc = nodeHtmlParser.parse(html);
    nodeHtmlDoc.querySelector("svg");
  });

  // sax-wasm
  await test("sax-wasm", async () => {
    // WASM shenanigans…
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
  });

  // cheerio
  await test("cheerio", async () => {
    const $ = cheerio.load(html);
    $("svg");
  });

  // jsdom (commented out because it runs out of memory)
  // await test("jsdom", async () => {
  //   const { document } = new JSDOM(html).window;
  //   document.querySelector("svg");
  // });

  // fast-html-dom-parser (commented out because it’s too slow :/)
  // await test("fast-html-dom-parser", async () => {
  //   const document = new fastHtmlDomParser.DOMparser(html);
  //   document.getElementsByTagName("svg");
  // });

  // end
  console.log(new Array(40).join("-"));
}
main();

async function test(name, cb) {
  const start = performance.now();
  for (let n = 0; n < ITERATIONS; n++) {
    await cb();
  }
  const end = performance.now();
  const timeMs = end - start;
  console.log(`| ${padRight(name)} | ${padLeft(timeMs.toFixed(2), 10)}ms |`);
  return timeMs;
}

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
