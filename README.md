# ndjson-whatwg

Streaming newline delimited json parser + serializer.
Same functionality as the [njdson](https://github.com/ndjson/ndjson.js) package but built on the [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

## Installation
```
npm i ndjson-whatwg
```

## Usage

```js
import ndjson from 'ndjson-whatwg'
```

#### ndjson.parse([opts])

Returns a transform stream that accepts newline delimited json buffers and emits objects of parsed data.

Example file:

```
{"foo": "bar"}
{"hello": "world"}
```

Parsing it:

```js
const file = await open(`data.ndjson`);

const readStream = file.readableWebStream()
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(ndjson.parse())

for await (const obj of readStream) {
  // obj is a javascript object
}
```


##### Options

- `strict` can be set to true to throw on non-valid JSON messages
- All other options are passed through to the [TextLineStream](https://github.com/chrispahm/TextLineStream) class.

#### ndjson.stringify([opts])

Returns a transform stream that accepts JSON objects and emits newline delimited json buffers.

Example usage (in Node):

```js
const nodeWritable = fs.createWriteStream(
  'new-file.ndjson', {encoding: 'utf-8'});
const webWritableStream = Writable.toWeb(nodeWritable);

const {readable, writable} = ndj.stringify();

readable.pipeTo(webWritableStream);

const writer = writable.getWriter();
try {
  writer.write({"foo": "bar"});  
} finally {
  await writer.close();
}
```

##### Options
- `EOL` can be an end-of-line character of choice
- Options are passed through to the json-stringify-safe function.

### LICENSE

MIT
