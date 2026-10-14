import {Type, type Static} from '@sinclair/typebox';
const text=(max=200)=>Type.String({minLength:1,maxLength:max});
const id=Type.String({pattern:'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'});
const optionalId=Type.Union([id,Type.Literal('')]);
const day=Type.String({pattern:'^$|^\\d{4}-\\d{2}-\\d{2}$'});
const color=Type.String({pattern:'^#[0-9a-fA-F]{6}$'});
const choice=<T extends string>(values:T[])=>Type.Union(values.map(v=>Type.Literal(v)));
const strict=<T extends Record<string,any>>(fields:T)=>Type.Object(fields,{additionalProperties:false});
export const Checklist=Type.Array(strict({id,text:text(),checked:Type.Boolean()}),{maxItems:100});
export const PreferencesSchema=strict({displayName:Type.Optional(Type.String({maxLength:80})),avatar:Type.Optional(Type.String({maxLength:200000,pattern:'^$|^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'})),theme:choice(['linen','cozy','focus','cloud','moss','midnight']),background:color,accent:color,textColor:color,font:choice(['basic','typewriter','bookish','rounded']),textSize:choice(['small','medium','large']),density:choice(['comfortable','compact'])});
export const GoalPlanSchema=strict({
 why:Type.String({maxLength:10000}),targetDate:day,reviewDate:day,
 outcome:choice(['working','submitted','achieved','paused']),
 milestones:Type.Array(strict({id,title:text(),dueDate:day,taskIds:Type.Array(id,{maxItems:500,uniqueItems:true})}),{maxItems:50}),
 noteIds:Type.Array(id,{maxItems:100,uniqueItems:true}),routineIds:Type.Array(id,{maxItems:50,uniqueItems:true}),
 applications:Type.Array(strict({id,institution:text(),programme:Type.String({maxLength:200}),scholarship:Type.String({maxLength:500}),url:Type.String({maxLength:2000}),deadline:day,verified:Type.Boolean(),status:choice(['research','shortlisted','preparing','submitted','offer','funded','declined']),documents:Type.String({maxLength:10000}),responseDate:day,notes:Type.String({maxLength:10000})}),{maxItems:100}),
 costs:Type.Array(strict({id,title:text(),currency:Type.String({pattern:'^[A-Z]{3}$'}),target:Type.Number({minimum:0,maximum:100000000}),saved:Type.Number({minimum:0,maximum:100000000}),dueDate:day}),{maxItems:100})
});
export type GoalPlan=Static<typeof GoalPlanSchema>;
export const emptyGoalPlan=():GoalPlan=>({why:'',targetDate:'',reviewDate:'',outcome:'working',milestones:[],noteIds:[],routineIds:[],applications:[],costs:[]});
export const schemas={
 area:strict({name:text(80),description:Type.String({maxLength:2000}),icon:text(8),color,archived:Type.Boolean()}),
 task:strict({calendar:Type.Optional(strict({eventId:id,title:text(),description:Type.String({maxLength:50000}),planDate:day,areaId:optionalId})),holdReason:Type.Optional(Type.String({maxLength:5000})),completion:Type.Optional(strict({note:Type.Boolean(),image:Type.Boolean(),file:Type.Boolean(),checklist:Type.Boolean()})),title:text(),description:Type.String({maxLength:50000}),areaId:optionalId,planDate:day,dueDate:day,status:choice(['todo','in_progress','on_hold','done','cancelled']),priority:choice(['normal','high']),minutes:Type.Optional(Type.Integer({minimum:0,maximum:1440})),checklist:Checklist,dependencies:Type.Array(id,{maxItems:20,uniqueItems:true}),resultText:Type.String({maxLength:50000}),routineId:optionalId,occurrenceKey:day}),
 note:strict({title:text(),body:Type.String({maxLength:200000}),areaId:optionalId,pinned:Type.Boolean()}),
 event:strict({google:Type.Optional(strict({calendarId:text(1024),eventId:text(1024),syncedAt:text(80)})),title:text(),description:Type.String({maxLength:50000}),areaId:optionalId,date:day,endDate:day,time:Type.String({pattern:'^$|^([01]\\d|2[0-3]):[0-5]\\d$'}),endTime:Type.String({pattern:'^$|^([01]\\d|2[0-3]):[0-5]\\d$'}),timezone:text(80)}),
 goal:strict({title:text(),areaId:optionalId,plan:Type.Optional(GoalPlanSchema),mode:choice(['numeric','tasks','checklist']),target:Type.Number({exclusiveMinimum:0,maximum:100000000}),unit:Type.String({maxLength:40}),taskIds:Type.Array(id,{maxItems:500,uniqueItems:true}),checklist:Checklist,entries:Type.Array(strict({id,date:day,amount:Type.Number({minimum:0,maximum:100000000}),note:Type.String({maxLength:500})}),{maxItems:1000})}),
 routine:strict({title:text(),areaId:optionalId,start:day,end:day,frequency:choice(['daily','weekly','monthly','yearly']),interval:Type.Integer({minimum:1,maximum:365}),weekdays:Type.Array(Type.Integer({minimum:1,maximum:7}),{maxItems:7,uniqueItems:true}),monthDay:Type.Integer({minimum:1,maximum:31}),lastDay:Type.Boolean(),paused:Type.Boolean(),resumeDate:day,timezone:text(80)}),
 preferences:PreferencesSchema
};
export type Kind=keyof typeof schemas;
export type Area=Static<typeof schemas.area>;
export type Task=Static<typeof schemas.task>;
export type Note=Static<typeof schemas.note>;
export type Event=Static<typeof schemas.event>;
export type Goal=Static<typeof schemas.goal>;
export type Routine=Static<typeof schemas.routine>;
export type Preferences=Static<typeof PreferencesSchema>;
export interface Entity<T=Record<string,unknown>>{id:string;kind:Kind;version:number;createdAt:string;updatedAt:string;deletedAt:string|null;archivedAt?:string|null;data:T}
export interface Snapshot{entities:Entity<any>[];serverDate:string;timezone:string}
export const kinds=Object.keys(schemas) as Kind[];
export const defaultPreferences:Preferences={theme:'linen',background:'#f8f7f4',accent:'#756292',textColor:'#30332f',font:'basic',textSize:'medium',density:'comfortable'};
export const emptyTask=(date=''):Task=>({title:'',description:'',areaId:'',planDate:date,dueDate:'',status:'todo',priority:'normal',checklist:[],dependencies:[],resultText:'',routineId:'',occurrenceKey:''});
