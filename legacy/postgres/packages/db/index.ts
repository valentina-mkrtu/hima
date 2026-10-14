import pg from 'pg';
import {resolve} from 'node:path';
import type {Entity} from '../contracts/index.js';
export const runtime=resolve(import.meta.dirname,'../../.runtime');
export const pool=new pg.Pool({host:runtime,port:55439,user:'dayweave_app',database:'dayweave',max:8});
export async function owned<T>(owner:string,work:(db:pg.PoolClient)=>Promise<T>,lock=false):Promise<T>{const db=await pool.connect();try{await db.query('BEGIN');await db.query("SELECT set_config('app.owner',$1,true)",[owner]);if(lock)await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[owner]);const result=await work(db);await db.query('COMMIT');return result;}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}}
export function entity(row:any):Entity<any>{return {id:row.id,kind:row.kind,data:row.data,version:row.version,createdAt:row.created_at.toISOString(),updatedAt:row.updated_at.toISOString(),deletedAt:row.deleted_at?.toISOString()||null};}
export async function records(db:pg.PoolClient){return (await db.query('SELECT * FROM entities ORDER BY created_at,id')).rows.map(entity);}
