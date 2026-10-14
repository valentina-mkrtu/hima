import 'fake-indexeddb/auto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compressAttachment, IMAGE_LIMIT} from '../packages/local/images';
import {initialize, saveEntity, storeFile, getFile, readState, moveTask, closeDatabase} from '../packages/local/store';
import {emptyTask} from '../packages/contracts/index';

const largeImage = () => new File([new Uint8Array(IMAGE_LIMIT)], 'photo.png', {type:'image/png'});
function encoder(t:any, sizes:number[], type='image/webp') {
 let closed=false, draws:number[][]=[];
 const canvas={width:0,height:0,getContext:()=>({drawImage:(_b:unknown,_x:number,_y:number,w:number,h:number)=>draws.push([w,h])}),toBlob:(cb:(b:Blob)=>void)=>cb(new Blob([new Uint8Array(sizes.shift()??IMAGE_LIMIT)],{type}))};
 const oldBitmap=Object.getOwnPropertyDescriptor(globalThis,'createImageBitmap'),oldDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'createImageBitmap',{configurable:true,value:async()=>({width:6000,height:3000,close:()=>{closed=true;}})});
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>canvas}});
 t.after(()=>{for(const [name,old] of [['createImageBitmap',oldBitmap],['document',oldDocument]] as const){if(old)Object.defineProperty(globalThis,name,old);else Reflect.deleteProperty(globalThis,name);}});
 return {canvas,draws,closed:()=>closed};
}
test('small images and non-image files are left byte-identical',async()=>{
 for(const file of [new File(['original'],'photo.jpg'),new File([new Uint8Array(IMAGE_LIMIT)],'video.mp4')]) assert.equal(await compressAttachment(file),file);
});
test('oversized images shrink with correct name, aspect ratio, strict size and cleanup',async t=>{
 const e=encoder(t,[IMAGE_LIMIT,1200]);const original=largeImage();const result=await compressAttachment(original);
 assert.equal(result.name,'photo.webp');assert.equal(result.type,'image/webp');assert.equal(result.size,1200);assert.equal(original.size,IMAGE_LIMIT);
 assert.deepEqual(e.draws,[[4096,2048],[2867,1433]]);assert.ok(e.closed());assert.equal(e.canvas.width,0);
});
test('PNG fallback is named correctly and uncompressible images fail after bounded work',async t=>{
 const e=encoder(t,[1200], 'image/png');assert.equal((await compressAttachment(largeImage())).name,'photo.png');
 await assert.rejects(()=>compressAttachment(largeImage()),/Could not compress/);assert.equal(e.draws.length,7);assert.ok(e.closed());
 await assert.rejects(()=>compressAttachment(new File([new Uint8Array(50_000_001)],'huge.jpg')),/under 50 MB/);
});
test('compressed bytes persist and a failed completion saves no partial attachments or status',async t=>{
 const e=encoder(t,[1200]);await initialize();t.after(closeDatabase);
 const row=await saveEntity('task',{...emptyTask(),title:'Image evidence'});
 const saved=await storeFile(row.id,largeImage());assert.equal(saved.size,1200);assert.equal(saved.name,'photo.webp');assert.equal((await getFile(saved.id)).blob.size,1200);
 const before=await readState();await assert.rejects(()=>moveTask(row,'done','Finished',[largeImage()]),/Could not compress/);assert.deepEqual(await readState(),before);assert.ok(e.closed());
});
