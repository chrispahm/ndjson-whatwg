import { test } from 'tap'
import ndj from '../src/main.mjs'

function concatString() {
  let string = ""
  
  return new TransformStream({
    transform(chunk) {
      string += chunk
    },
    flush(controller) {
      controller.enqueue(string)
    }
  });
}

test('.parse', async function(t) {
  const {readable, writable} = ndj.parse()

  const writer = writable.getWriter();
  writer.write('{"hello": "world"}\n');
  writer.close();
  
  for await (const obj of readable) {
    t.same(obj.hello, 'world')
    t.end()      
  } 
})

test('.parse twice', async function(t) {
  const {readable, writable} = ndj.parse()

  const writer = writable.getWriter();
  writer.write('{"hello": "world"}\n{"hola": "mundo"}\n')
  writer.close();
  
  const expected = [['hello','world'], ['hola','mundo']]
  let i = 0
  for await (const obj of readable) {
    t.same(obj[expected[i][0]], expected[i][1])
    i++
  } 
  t.end()

})

test('.parse - strict:true error', async function (t) {
  const {readable, writable} = ndj.parse({strict: true})

  const writer = writable.getWriter();

  writer.write('{"no":"json"\n').catch(() => {})
  
  try {
    for await (const obj of readable) {
      // won't reach
    } 
  } catch (e) {
    // handle later
  }
  
  try {
    await writer.close();
  } catch (e) {
    t.same(e.message,'Could not parse row {"no":"json"...')
    t.end()
  }
})

test('.parse - strict:false error', async function(t) {
  const {readable, writable} = ndj.parse({strict: false})

  const writer = writable.getWriter();
  writer.write('{"json":false\n{"json":true}\n').catch(() => {});
  
  try {
    const { value: data } = await readable.getReader().read()
    t.same(data.json, true)
    t.end()
  } catch (e) {
    console.log(e)
    
    t.fail('should not call an error')  
  }
  
  try {
    await writer.close();    
  } catch (e) {
    t.fail('should not call an error')
  }
  
})

test('.stringify', async function(t) {
  const {readable, writable} = ndj.stringify()

  const writer = writable.getWriter();
  
  const readStream = readable.pipeThrough(concatString());
  
  writer.write({hello: 'world'});
  writer.close();
  
  for await (const data of readStream) {
    t.same(data, '{"hello":"world"}' + '\n')
    t.end()      
  } 
})

test('.stringify circular', async function(t) {
  const {readable, writable} = ndj.stringify()

  const writer = writable.getWriter();
  
  const readStream = readable.pipeThrough(concatString());
  
  const obj = {}
  obj.obj = obj
  
  writer.write(obj);
  writer.close();
  
  for await (const data of readStream) {
    t.same(data, '{"obj":"[Circular ~]"}' + '\n')
    t.end()      
  } 
})