import {DateTime} from 'luxon';
import type {Entity,Task,Routine,Goal} from '../contracts/index.js';
export class DomainError extends Error{constructor(public code:string,message:string,public status=422){super(message);}}
export function requireRule(ok:unknown,code:string,message:string,status=422):asserts ok{if(!ok)throw new DomainError(code,message,status);}
export function validDay(value:string){return !value||(DateTime.fromISO(value).isValid&&DateTime.fromISO(value).toISODate()===value);}
export function ready(task:Task,tasks:Entity<Task>[]){return task.dependencies.every(id=>tasks.some(t=>t.id===id&&!t.deletedAt&&t.data.status==='done'));}
export function validateTask(candidate:Entity<Task>,tasks:Entity<Task>[]){const task=candidate.data;
 requireRule(!task.dependencies.includes(candidate.id),'SELF_DEPENDENCY','A task cannot depend on itself.');
 for(const id of task.dependencies)requireRule(tasks.some(t=>t.id===id&&!t.deletedAt),'MISSING_PREREQUISITE','Choose an existing task as the prerequisite.');
 const graph=new Map(tasks.filter(t=>!t.deletedAt).map(t=>[t.id,t.data.dependencies]));graph.set(candidate.id,task.dependencies);
 const visited=new Set<string>(),visiting=new Set<string>();
 function visit(id:string){requireRule(!visiting.has(id),'DEPENDENCY_CYCLE','These dependencies would create a loop.');if(visited.has(id))return;requireRule(visited.size<1000,'GRAPH_LIMIT','This dependency chain is too large.');visiting.add(id);for(const next of graph.get(id)||[])visit(next);visiting.delete(id);visited.add(id);}
 visit(candidate.id);
 const previous=tasks.find(t=>t.id===candidate.id);
 if((task.status==='done'&&(previous?.data.status!=='done'||JSON.stringify(previous.data.dependencies)!==JSON.stringify(task.dependencies)))||(task.status==='in_progress'&&previous?.data.status!=='in_progress'))requireRule(ready(task,tasks),'TASK_BLOCKED','Finish the prerequisites before starting or completing this task.',409);
 requireRule(validDay(task.planDate)&&validDay(task.dueDate),'INVALID_DATE','Choose a valid calendar date.');
}
export function occurrenceDates(rule:Routine,from:string,through:string):string[]{
 const start=DateTime.fromISO(rule.start,{zone:rule.timezone});const until=DateTime.fromISO(through,{zone:rule.timezone});
 requireRule(start.isValid&&until.isValid,'INVALID_SCHEDULE','Choose a valid start date and timezone.');
 if(rule.paused)return [];
 const floor=DateTime.fromISO(from,{zone:rule.timezone}),end=rule.end?DateTime.fromISO(rule.end,{zone:rule.timezone}):until;
 let cursor=start>floor?start:floor;const output:string[]=[];let checked=0;
 while(cursor<=until&&cursor<=end){requireRule(++checked<=4000,'RANGE_LIMIT','Preview a shorter date range.');const d=cursor.toISODate()!;
 const days=Math.round(cursor.startOf('day').diff(start.startOf('day'),'days').days);
 const weeks=Math.round(cursor.startOf('week').diff(start.startOf('week'),'weeks').weeks);
 const months=(cursor.year-start.year)*12+cursor.month-start.month;
 const match=rule.frequency==='daily'?days%rule.interval===0:rule.frequency==='weekly'?weeks%rule.interval===0&&rule.weekdays.includes(cursor.weekday):rule.frequency==='monthly'?months%rule.interval===0&&(rule.lastDay?cursor.day===cursor.daysInMonth:cursor.day===rule.monthDay):(cursor.year-start.year)%rule.interval===0&&cursor.month===start.month&&cursor.day===start.day;
 if(match&&(!rule.resumeDate||d>=rule.resumeDate))output.push(d);cursor=cursor.plus({days:1});}
 return output;
}
export function progress(goal:Goal,tasks:Entity<Task>[]){let current=0,target=goal.target;
 if(goal.mode==='numeric')current=Number(goal.entries.reduce((n,e)=>n+Math.round(e.amount*1000000),0)/1000000);
 if(goal.mode==='checklist'){current=goal.checklist.filter(c=>c.checked).length;target=goal.checklist.length;}
 if(goal.mode==='tasks'){const linked=tasks.filter(t=>goal.taskIds.includes(t.id)&&!t.deletedAt&&t.data.status!=='cancelled');current=linked.filter(t=>t.data.status==='done').length;target=linked.length;}
 return {current,target,percent:target?Math.min(100,Math.round(current/target*100)):0};
}
