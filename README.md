# Node.js DOM performance benchmarks

⚠️ **This is a cheap test!** My usecase was parsing a unique document once, and running a query selector once. This is very different from parsing a document once, and running many, many queries on it.

### Methodology

Parse a long document (the GitHub.com homepage, © GitHub) 1,000× consecutively.

### Results

| Package                                                |   Result |  Comparison  |
| :----------------------------------------------------- | -------: | :----------: |
| [hypertag](https://npmjs.com/hypertag)                 |  `1.48s` |      —       |
| [fast-html-parser](https://npmjs.com/fast-html-parser) |  `1.63s` |  10% slower  |
| [node-html-parser](https://npmjs.com/node-html-parser) |  `5.24s` | 254% slower  |
| [sax-wasm](https://npmjs.com/sax-wasm)\*               | `10.82s` | 631% slower  |
| [cheerio](https://npmjs.com/cheerio)                   | `22.48s` | 1419% slower |
| [parse5](https://npmjs.com/parse5)                     | `22.88s` | 1546% slower |

\*I know what you’re thinking—“why is WASM slower?” Like I said, my methodology here was **parsing a document 1,000×.** WASM has a very expensive startup cost that JS doesn’t. I’m sure that once it’s loaded, it would run circles around everything else. So take these benchmarks with a grain of salt if you’re reusing the same document and not throwing it away each time like I was doing.
