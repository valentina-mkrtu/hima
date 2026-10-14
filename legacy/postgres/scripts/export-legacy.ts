// One-time, read-only migration from the previous prototype. Never served as a web asset.
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pool,owned,records,runtime} from '../packages/db/index.js';
const owner='10000000-0000-4000-8000-000000000001';
try{const account=(await pool.query('SELECT timezone FROM accounts WHERE id=$1',[owner])).rows[0];if(!account)throw new Error('No previous workspace found.');const backup=await owned(owner,async db=>{const entities=await records(db),attachments=[];for(const file of (await db.query('SELECT * FROM attachments')).rows){const bytes=await readFile(resolve(runtime,'files',file.object_key));attachments.push({id:file.id,parentId:file.parent_id,name:file.name,size:bytes.length,checksum:createHash('sha256').update(bytes).digest('hex'),base64:bytes.toString('base64')});}return {format:'dayweave-device',version:1,exportedAt:new Date().toISOString(),timezone:account.timezone,entities,generated:{},attachments};});await mkdir(runtime,{recursive:true,mode:0o700});await writeFile(resolve(runtime,'device-migration-backup.json'),JSON.stringify(backup),{mode:0o600});console.log(`Preserved ${backup.entities.length} items and ${backup.attachments.length} files in the private migration backup.`);}finally{await pool.end();}
