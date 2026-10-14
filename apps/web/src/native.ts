interface AndroidBridge {copyText:(text:string)=>void;beginExport:()=>string;appendExport:(id:string,data:string)=>void;cancelExport:(id:string)=>void;finishExport:(id:string,name:string,mime:string)=>void}
declare global {interface Window {HimaAndroid?:AndroidBridge}}
export const isAndroidApp=()=>typeof window!=='undefined'&&Boolean(window.HimaAndroid)&&location.hostname==='appassets.androidplatform.net';
export async function copyText(text:string){if(isAndroidApp()){window.HimaAndroid!.copyText(text);return;}await navigator.clipboard.writeText(text);}
export async function saveAndroidBlob(blob:Blob,name:string){const bridge=window.HimaAndroid!;const id=bridge.beginExport();try{for(let i=0;i<blob.size;i+=49152){const bytes=new Uint8Array(await blob.slice(i,i+49152).arrayBuffer());bridge.appendExport(id,btoa(String.fromCharCode(...bytes)));}bridge.finishExport(id,name,blob.type.split(';')[0]||'application/octet-stream');}catch(e){bridge.cancelExport(id);throw e;}}
