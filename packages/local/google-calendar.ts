import {DateTime} from 'luxon';
import type {Event as PlannerEvent,Entity} from '../contracts/index';
import {change,validate,type State} from './store';
export interface GoogleEvent {id:string;status?:string;summary?:string;description?:string;location?:string;start?:{date?:string;dateTime?:string};end?:{date?:string;dateTime?:string}}
export interface CalendarWindow {from:string;to:string;zone:string}
export function calendarWindow(zone:string):CalendarWindow {const today=DateTime.now().setZone(zone).startOf('day');return {from:today.minus({days:30}).toISO()!,to:today.plus({years:1}).toISO()!,zone};}
export function convertGoogleEvent(event:GoogleEvent,calendarId:string,zone:string,syncedAt:string):PlannerEvent|null {
 if(event.status==='cancelled')return null;
 if(!event.id||!calendarId)throw new Error('Google returned an event without an identifier. Nothing was saved.');
 const allDay=Boolean(event.start?.date);
 const start=allDay?DateTime.fromISO(event.start!.date!,{zone}):DateTime.fromISO(event.start?.dateTime||'',{zone});
 const exclusiveEnd=allDay?DateTime.fromISO(event.end?.date||'',{zone}):DateTime.fromISO(event.end?.dateTime||'',{zone});
 if(!start.isValid||!exclusiveEnd.isValid||exclusiveEnd<=start)throw new Error('Google returned an invalid event date. Nothing was saved.');
 const end=allDay?exclusiveEnd.minus({days:1}):exclusiveEnd;
 return {title:(event.summary?.trim()||'Untitled Google event').slice(0,200),description:[event.description,event.location&&`Location: ${event.location}`].filter(Boolean).join('\n\n').slice(0,50000),areaId:'',date:start.toISODate()!,endDate:end.toISODate()!,time:allDay?'':start.toFormat('HH:mm'),endTime:allDay?'':end.toFormat('HH:mm'),timezone:zone,google:{calendarId,eventId:event.id,syncedAt}};
}
function overlaps(data:PlannerEvent,range:CalendarWindow){const start=DateTime.fromISO(`${data.date}T${data.time||'00:00'}`,{zone:data.timezone});const end=data.endTime?DateTime.fromISO(`${data.endDate}T${data.endTime}`,{zone:data.timezone}):DateTime.fromISO(data.endDate,{zone:data.timezone}).plus({days:1});return start.toMillis()<DateTime.fromISO(range.to).toMillis()&&end.toMillis()>DateTime.fromISO(range.from).toMillis();}
// Reconcile only a completely fetched calendar window in one transaction. No partial imports.
export function reconcileGoogleCalendar(state:State,calendarId:string,events:GoogleEvent[],range:CalendarWindow){
 if(events.length>2500)throw new Error('This calendar exceeds the 2,500-event sync limit.');
 const at=new Date().toISOString(),data=events.map(e=>convertGoogleEvent(e,calendarId,range.zone,at)).filter((e):e is PlannerEvent=>e!==null);
 const ids=new Set(data.map(d=>d.google!.eventId));if(ids.size!==data.length)throw new Error('Duplicate Google events received. Nothing was saved.');
 let added=0,updated=0,removed=0;
 for(const d of data){const existing=state.entities.find(r=>r.kind==='event'&&r.data.google?.calendarId===calendarId&&r.data.google.eventId===d.google!.eventId);const row:Entity<PlannerEvent>=existing?{...existing,data:d,version:existing.version+1,updatedAt:at,deletedAt:null}:{id:crypto.randomUUID(),kind:'event',version:1,createdAt:at,updatedAt:at,deletedAt:null,data:d};validate(row,state.entities);if(existing){state.entities[state.entities.indexOf(existing)]=row;updated++;}else{state.entities.push(row);added++;}}
 for(const row of state.entities){if(row.kind==='event'&&!row.deletedAt&&row.data.google?.calendarId===calendarId&&!ids.has(row.data.google.eventId)&&overlaps(row.data,range)){row.deletedAt=at;row.updatedAt=at;row.version++;removed++;}}
 if(state.entities.length>10000)throw new Error('The workspace limit of 10,000 items would be exceeded. Nothing was saved.');
 return {added,updated,removed};
}
export function importGoogleCalendar(calendarId:string,events:GoogleEvent[],range:CalendarWindow,revision:number){return change(s=>{if(s.revision!==revision)throw new Error('Your planner changed during sync. Try Sync now again.');return reconcileGoogleCalendar(s,calendarId,events,range);});}
export function removeGoogleCopies(){return change(s=>{let count=0;for(const row of s.entities)if(row.kind==='event'&&row.data.google&&!row.deletedAt){row.deletedAt=new Date().toISOString();row.updatedAt=row.deletedAt;row.version++;count++;}return count;});}
