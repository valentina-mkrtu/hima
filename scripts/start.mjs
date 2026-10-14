import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const build=spawnSync('npm',['run','build'],{stdio:'inherit'});if(build.status)process.exit(build.status);
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.kill(signal));
server.on('exit',code=>process.exit(code||0));
