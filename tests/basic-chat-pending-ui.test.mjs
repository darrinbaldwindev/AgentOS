import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// Interaction contract only; this is not a browser layout/viewport test.
function element() {
  return {textContent:'',value:'',hidden:false,disabled:false,handlers:{},
    addEventListener(name, fn) { this.handlers[name]=fn; }, append() {}};
}
for (const succeeds of [true, false]) test(`pending send preserves composer and truthful status; success=${succeeds}`, async () => {
  const nodes=Object.fromEntries(['history','status','chat','message','send','error'].map(id=>[id,element()]));
  const composer=element();
  let finish;
  const pending = new Promise(resolve=>{finish=resolve;});
  const snapshot={ready:true,history:[],status:'COMPLETE'};
  const fetch=async path => path==='/api/state' ? {json:async()=>snapshot} : pending;
  const document={getElementById:id=>nodes[id],querySelector:()=>composer,querySelectorAll:()=>[],createElement:element};
  runInNewContext(await readFile(new URL('../ui/basic-chat.js',import.meta.url),'utf8'),{document,fetch});
  await new Promise(resolve=>setImmediate(resolve));
  nodes.message.value='Keep this draft';
  const sending=nodes.chat.handlers.submit({preventDefault(){}});
  assert.match(nodes.status.textContent,/WORKING/);
  assert.equal(composer.hidden,false);
  assert.equal(nodes.message.hidden,false);
  assert.equal(nodes.send.disabled,true);
  finish({ok:succeeds,json:async()=>succeeds?snapshot:{error:'LOCAL_TEST_BLOCKED'}});
  await sending;
  assert.equal(nodes.send.disabled,false);
  assert.equal(nodes.message.value,succeeds?'':'Keep this draft');
  assert.equal(nodes.error.textContent,succeeds?'':'LOCAL_TEST_BLOCKED');
});
