import {DateTime} from 'luxon';
import type {Entity,Task} from '../../../packages/contracts/index';
import {defaultCompletion} from '../../../packages/domain/completion';
import {Modal,Icon,Files,History} from './components';
const names={todo:'To do',in_progress:'In progress',on_hold:'On hold',done:'Done',cancelled:'Cancelled'};
const day=(value:string)=>value?DateTime.fromISO(value).toLocaleString(DateTime.DATE_MED):'Not set';
export function TaskView({row,all,busy,error,onClose,onEdit,onCheck,onArchive,onTrash}:{row:Entity<Task>;all:Entity<any>[];busy:boolean;error:string;onClose:()=>void;onEdit:()=>void;onCheck:(id:string,checked:boolean)=>void;onArchive:()=>void;onTrash:()=>void}){
 const d=row.data,area=all.find(a=>a.kind==='area'&&a.id===d.areaId),rules=d.completion||defaultCompletion;
 const requirements=([['note','Write a completion note'],['image','Attach an image'],['file','Attach a file'],['checklist','Complete every checklist step']] as const).filter(([key])=>rules[key]);
 return <Modal title="Task" className="task-view" onClose={onClose} actions={<button className="icon-button" aria-label="Edit task" title="Edit task" disabled={busy} onClick={onEdit}><Icon name="pencil"/></button>}>
 <div className="task-view-status"><span>{names[d.status]}</span>{d.priority==='high'&&<span>High priority</span>}</div><h1 className="task-view-title">{d.title}</h1>
 <dl className="task-view-metadata"><div><dt>Life area</dt><dd>{area?`${area.data.icon} ${area.data.name}`:'Inbox / no area'}</dd></div><div><dt>Planned for</dt><dd>{day(d.planDate)}</dd></div><div><dt>Due by</dt><dd>{day(d.dueDate)}</dd></div>{!!d.minutes&&<div><dt>Time needed</dt><dd>{d.minutes} minutes</dd></div>}</dl>
 {d.calendar&&<p className="muted small">From your calendar · changes made to this task stay on this card. Calendar updates refresh fields you haven’t customized.</p>}<section className="task-view-section"><h3>What needs to be done</h3><p className={d.description?'task-view-prose':'muted'}>{d.description||'No additional details yet.'}</p></section>
 {d.checklist.length>0&&<section className="task-view-section"><div className="section-head"><h3>Checklist</h3><span className="muted small">{d.checklist.filter(c=>c.checked).length} / {d.checklist.length}</span></div>{d.checklist.map(c=><label className={`task-view-check ${c.checked?'checked':''}`} key={c.id}><input type="checkbox" checked={c.checked} disabled={busy} onChange={e=>onCheck(c.id,e.target.checked)}/><span>{c.text}</span></label>)}<p className="muted small" role="status">{busy?'Saving…':'Checkmarks save automatically.'}</p></section>}
 <section className="task-view-section"><h3>Requirements to finish</h3>{requirements.length?<ul>{requirements.map(([key,label])=><li key={key}>{label}</li>)}</ul>:<p className="muted">No extra completion requirements.</p>}</section>
 {d.dependencies.length>0&&<section className="task-view-section"><h3>Ready after</h3><ul>{d.dependencies.map(id=>{const task=all.find(t=>t.id===id);return <li key={id}>{task?.data.title||'Unavailable task'} <span className="muted small">· {task?names[task.data.status as Task['status']]:'Unavailable'}</span></li>;})}</ul></section>}
 {d.holdReason&&<section className="task-view-section"><h3>On hold reason</h3><p className="task-view-prose">{d.holdReason}</p></section>}
 {d.resultText&&<section className="task-view-section"><h3>Completion note</h3><p className="task-view-prose">{d.resultText}</p></section>}
 {d.routineId&&<p className="muted small">Recurring task · {day(d.occurrenceKey)}</p>}
 {error&&<p className="error" role="alert">{error}</p>}<div className="form-actions"><button className="text-button" disabled={busy} onClick={onArchive}>Archive task</button><button className="text-button danger" disabled={busy} onClick={onTrash}>Move to Trash</button></div><Files parent={row.id} readOnly/><History key={row.version} id={row.id}/>
 </Modal>;
}
