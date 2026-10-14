import {buildApp,materialize} from './app.js';
import {owned,pool} from '../../packages/db/index.js';
if(process.env.LOCAL_PROTOTYPE!=='1'||process.env.NODE_ENV==='production')throw new Error('This build is a loopback-only local prototype. Run npm run prototype. Managed identity and production storage are required before deployment.');
const app=await buildApp({serveStatic:true});await app.listen({host:'127.0.0.1',port:8787});console.log('Dayweave prototype: http://127.0.0.1:8787');
let ticking=false;async function tick(){if(ticking)return;ticking=true;try{for(const a of (await pool.query('SELECT id,timezone FROM accounts')).rows)await owned(a.id,db=>materialize(db,a.id,a.timezone),true);}catch{console.error('Routine refresh failed; it will retry.');}finally{ticking=false;}}
await tick();const timer=setInterval(tick,60*60*1000);timer.unref();
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,async()=>{clearInterval(timer);await app.close();await pool.end();process.exit();});
