import {randomUUID} from 'node:crypto';
import type pg from 'pg';
import {emptyTask} from '../../packages/contracts/index.js';
import {DateTime} from 'luxon';
export async function samplePlanner(db:pg.PoolClient,owner:string,zone:string){
 const existing=await db.query("SELECT FROM entities WHERE kind<>'preferences' LIMIT 1");if(existing.rowCount)return {created:false};
 const today=DateTime.now().setZone(zone).toISODate()!;async function insert(kind:string,data:unknown){const id=randomUUID();await db.query('INSERT INTO entities(owner_id,id,kind,data) VALUES($1,$2,$3,$4)',[owner,id,kind,JSON.stringify(data)]);return id;}
 const home=await insert('area',{name:'Home & everyday',description:'Make a little room for a good day.',icon:'⌂',color:'#9d6648',archived:false}),work=await insert('area',{name:'Work',description:'Good work, at a human pace.',icon:'▣',color:'#527398',archived:false}),hobbies=await insert('area',{name:'Hobbies',description:'Follow your curiosity.',icon:'✦',color:'#756292',archived:false});
 const supplies=await insert('task',{...emptyTask(today),title:'Pick up supplies for the bookshelf',areaId:hobbies,status:'done'});
 await insert('task',{...emptyTask(today),title:'Give the bookshelf a fresh coat',areaId:hobbies,dependencies:[supplies]});
 await insert('task',{...emptyTask(today),title:'A weekly reset',areaId:home,checklist:[{id:randomUUID(),text:'Clear the desk',checked:false},{id:randomUUID(),text:'Plan a few meals',checked:false}]});
 await insert('task',{...emptyTask(today),title:'Give the portfolio some love',areaId:work,status:'in_progress'});
 await insert('task',{...emptyTask(today),title:'Take a little creative break',areaId:hobbies,status:'in_progress'});
 await insert('task',{...emptyTask(today),title:'Read a chapter before bed',areaId:hobbies,status:'on_hold'});
 await insert('task',{...emptyTask(today),title:'A slow start & a little fresh air',areaId:home,status:'done'});
 await insert('note',{title:'A few things to make room for',body:'# A little more of this\n\n- Time outside\n- Making things with my hands\n- Reading without rushing\n\nThis is a sample note. Make it yours.',areaId:hobbies,pinned:true});
 await insert('goal',{title:'Read a little more',areaId:hobbies,mode:'numeric',target:12,unit:'books',taskIds:[],checklist:[],entries:[{id:randomUUID(),date:today,amount:3,note:'A little beginning.'}]});
 return {created:true};
}
