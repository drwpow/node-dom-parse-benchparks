# Node.js DOM performance benchmarks

⚠️ **This is a cheap test!** My usecase was parsing a unique document once, and running a query selector once. This is very different from parsing a document once, and running many, many queries on it.

### Methodology

1. Parse a long document (the GitHub.com homepage, © GitHub)
2. Query for a specific element, using whatever the parser has available
3. Repeat 999×

### Results

| Package                                                        |   Result |  Comparison  |
| :------------------------------------------------------------- | -------: | :----------: |
| [hypertag](https://npmjs.com/hypertag)                         |  `1.48s` |      —       |
| [fast-html-parser](https://npmjs.com/fast-html-parser)         |  `1.63s` |  10% slower  |
| [htmlparser2](https://npmjs.com/htmlparser2)                   |  `3.69s` | 149% slower  |
| [node-html-parser](https://npmjs.com/node-html-parser)         |  `5.24s` | 254% slower  |
| [sax-wasm](https://npmjs.com/sax-wasm)\*                       | `10.82s` | 631% slower  |
| [cheerio](https://npmjs.com/cheerio)                           | `22.48s` | 1419% slower |
| [fast-html-dom-parser](https://npmjs.com/fast-html-dom-parser) | `94.48s` | 6284% slower |
| [jsdom](https://npmjs.com/jsdom)\*\*                           |      ??? |              |

\*I know what you’re thinking—“why is WASM slower?” Like I said, my methodology here was **parsing a document 1,000×.** WASM has a very expensive startup cost that JS doesn’t. I’m sure that once it’s loaded, it would run circles around everything else. So take these benchmarks with a grain of salt if you’re reusing the same document and not throwing it away each time like I was doing.

\*\* jsdom ran out of memory after taking at least 30 seconds. I didn’t get to benchmark it, but that told me all I needed to know (dunno what run it was on either).
