import type {Task} from '../contracts/index';
import {requireRule} from './index';
export const defaultCompletion={note:true,image:false,file:false,checklist:false};
export function checkTaskFinish(task:Task,files:{name:string}[]){
 if(task.status==='on_hold')requireRule(task.holdReason?.trim(),'HOLD_REASON','Write a reason before putting this task on hold.');
 if(task.status!=='done')return;
 const rules=task.completion||defaultCompletion;
 if(rules.note)requireRule(task.resultText.trim(),'COMPLETION_NOTE','Write a completion note before marking this task done.');
 if(rules.image)requireRule(files.some(f=>/\.(png|jpe?g|webp)$/i.test(f.name)),'COMPLETION_IMAGE','Attach a PNG, JPEG or WebP image to complete this task.');
 if(rules.file)requireRule(files.length,'COMPLETION_FILE','Attach a file to complete this task.');
 if(rules.checklist)requireRule(task.checklist.length&&task.checklist.every(c=>c.checked),'COMPLETION_CHECKLIST','Complete every checklist step before marking this task done.');
}
