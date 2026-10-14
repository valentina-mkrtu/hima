import {spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,chmodSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'), runtime=resolve(root,'.runtime'), data=resolve(runtime,'postgres');
mkdirSync(runtime,{recursive:true,mode:0o700});chmodSync(runtime,0o700);
function run(cmd,args){const p=spawnSync(cmd,args,{stdio:'inherit'});if(p.error)throw p.error;if(p.status!==0)process.exit(p.status||1);}
if(process.argv[2]==='stop'){run('pg_ctl',['-D',data,'-m','fast','stop']);process.exit();}
if(!existsSync(resolve(data,'PG_VERSION')))run('initdb',['-D',data,'--username=dayweave_admin','--auth-local=trust','--auth-host=reject','--encoding=UTF8','--no-locale']);
const status=spawnSync('pg_ctl',['-D',data,'status'],{stdio:'ignore'});
if(status.status!==0)run('pg_ctl',['-D',data,'-l',resolve(runtime,'postgres.log'),'-o',`-k ${runtime} -p 55439 -h ''`,'-w','start']);
console.log('Dayweave PostgreSQL is ready (private local socket, port 55439).');
