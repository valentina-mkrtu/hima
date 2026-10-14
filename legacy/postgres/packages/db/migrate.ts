import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {runtime} from './index.js';
const admin=new pg.Client({host:runtime,port:55439,user:'dayweave_admin',database:'postgres'});await admin.connect();
await admin.query("DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='dayweave_app') THEN CREATE ROLE dayweave_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS; END IF; END $$");
if(!(await admin.query("SELECT FROM pg_database WHERE datname='dayweave'")).rowCount)await admin.query('CREATE DATABASE dayweave');await admin.end();
const db=new pg.Client({host:runtime,port:55439,user:'dayweave_admin',database:'dayweave'});await db.connect();await db.query('BEGIN');await db.query(await readFile(new URL('./migrations/001_foundation.sql',import.meta.url),'utf8'));await db.query('COMMIT');await db.end();console.log('Dayweave schema ready. Runtime role cannot bypass row-level security.');
