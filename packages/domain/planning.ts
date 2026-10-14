import type {Entity,Goal,Task} from '../contracts/index';
import {ready} from './index';
export const openTask=(t:Entity<Task>)=>!t.deletedAt&&!['done','cancelled'].includes(t.data.status);
export function goalTasks(goal:Goal,tasks:Entity<Task>[],today:string){return tasks.filter(t=>!t.deletedAt&&(goal.taskIds.includes(t.id)||(!!t.data.routineId&&goal.plan?.routineIds.includes(t.data.routineId)&&t.data.occurrenceKey<=today)));}
export function nextActions(goal:Goal,tasks:Entity<Task>[],today:string){return goalTasks(goal,tasks,today).filter(t=>openTask(t)&&t.data.status!=='on_hold'&&ready(t.data,tasks)).sort((a,b)=>(a.data.dueDate||a.data.planDate||'9999').localeCompare(b.data.dueDate||b.data.planDate||'9999')).slice(0,3);}
export function needsReplan(t:Entity<Task>,today:string){return openTask(t)&&!!t.data.planDate&&t.data.planDate<today;}
export function goalNeedsReview(g:Goal,tasks:Entity<Task>[],today:string){if(g.plan?.outcome==='achieved'||g.plan?.outcome==='paused')return false;return !!(g.plan?.reviewDate&&g.plan.reviewDate<=today)||!!(g.plan?.targetDate&&g.plan.targetDate<today)||!nextActions(g,tasks,today).length;}
// Treat spreadsheet formula prefixes as text, including after leading whitespace.
export function csvCell(value:unknown){let s=String(value??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
