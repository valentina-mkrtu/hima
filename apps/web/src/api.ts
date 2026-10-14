import {isAndroidApp,saveAndroidBlob} from './native';
// Local application adapter. No HTTP requests, account tokens, or server are used.
import type {Entity,Kind,Snapshot} from '../../../packages/contracts/index';
import {emptyTask} from '../../../packages/contracts/index';
import {DateTime} from 'luxon';
import * as store from '../../../packages/local/store';
export interface Session{name:string;timezone:string;mode:string}
export async function currentSession():Promise<Session>{const s=await store.readState();if(!s.initialized)throw Object.assign(new Error('Open your device workspace to begin.'),{status:401});return {name:'My space',timezone:s.timezone,mode:'device'};}
export async function login(){await store.initialize();return currentSession();}
let generating:Promise<unknown>|undefined;
export async function load():Promise<Snapshot>{generating??=store.materialize().finally(()=>{generating=undefined;});await generating;await store.materializeCalendar();const s=await store.readState();return {entities:s.entities,timezone:s.timezone,serverDate:DateTime.now().setZone(s.timezone).toISODate()!};}
export const save=store.saveEntity;
export const lifecycle=store.lifecycle;
export const archive=store.archiveEntity;
export const upload=store.storeFile;
export async function samplePlanner(){return store.change(s=>{if(s.entities.some(r=>r.kind!=='preferences'))return;const date=DateTime.now().setZone(s.timezone).toISODate()!;function add(kind:Kind,data:any){const id=crypto.randomUUID(),at=new Date().toISOString();s.entities.push({id,kind,data,version:1,createdAt:at,updatedAt:at,deletedAt:null});return id;}const home=add('area',{name:'Home & everyday',description:'A little room for a good day.',icon:'⌂',color:'#9d6648',archived:false});const hobbies=add('area',{name:'Hobbies',description:'Follow your curiosity.',icon:'✦',color:'#756292',archived:false});const prerequisite=add('task',{...emptyTask(date),title:'Pick up supplies for the bookshelf',areaId:hobbies,status:'done'});add('task',{...emptyTask(date),title:'Give the bookshelf a fresh coat',areaId:hobbies,dependencies:[prerequisite]});add('task',{...emptyTask(date),title:'A weekly reset',areaId:home});add('task',{...emptyTask(date),title:'Take a little creative break',areaId:hobbies,status:'in_progress'});add('task',{...emptyTask(date),title:'Read a chapter before bed',areaId:hobbies,status:'on_hold'});});}
export function downloadBlob(blob:Blob,name:string){if(isAndroidApp()){void saveAndroidBlob(blob,name).catch(e=>alert(`Could not prepare download: ${e.message}`));return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export async function downloadFile(id:string){const {blob,file}=await store.getFile(id);downloadBlob(blob,file.name);}
export const listFiles=store.listFiles;
export const removeFile=store.removeFile;
export async function history(id:string){return (await store.readState()).activity.filter(a=>a.entityId===id).slice(-30).reverse();}
