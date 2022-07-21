import TextLineStream from 'textlinestream'
import jsonStringify from 'json-stringify-safe'

export function stringify(opts) {
  let EOL = opts?.EOL ?? '\n';
  
  return new TransformStream({
    transform(obj, controller) {
      controller.enqueue(jsonStringify(obj) + EOL);
    }
  })
}

export function parse(opts) {
  const strict = opts?.strict ?? false;
  
  function parseRow (row) {
    try {
      if (row) return JSON.parse(row);
    } catch (e) {
      if (opts?.strict) {
        throw Error('Could not parse row ' + row.slice(0, 50) + '...');
      }
    }
  }

  return new TextLineStream({
    mapperFun: parseRow,
    ...opts
  })
}

export default { parse, stringify }