import type {Entity,Note} from '../../../packages/contracts/index';
export function NoteCard({note,onOpen}:{note:Entity<Note>;onOpen:()=>void}){
 // Preview only a Markdown heading, never paragraphs or fenced code.
 let fence='',heading='';
 for(const line of note.data.body.split('\n')){
  const marker=line.trimStart().match(/^(`{3,}|~{3,})/);
  if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence='';continue;}
  const match=!fence&&line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
  if(match){heading=`${match[1]} ${match[2]}`;break;}
 }
 return <button className="note-card note-summary" onClick={onOpen}><h3>{note.data.title}</h3>{heading&&<span className="note-heading-preview">{heading}</span>}<time dateTime={note.updatedAt}>{new Date(note.updatedAt).toLocaleDateString()}</time></button>;
}
