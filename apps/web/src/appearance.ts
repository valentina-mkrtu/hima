import type {Preferences} from '../../../packages/contracts/index';
export const themes:Record<Preferences['theme'],{name:string;caption:string;p:Preferences}>={
 linen:{name:'Linen',caption:'Soft, light & familiar',p:{theme:'linen',background:'#f8f7f4',accent:'#756292',textColor:'#30332f',font:'basic',textSize:'medium',density:'comfortable'}},
 cozy:{name:'Cozy warm',caption:'Paper, coffee & slower days',p:{theme:'cozy',background:'#f5ecdf',accent:'#9d6648',textColor:'#44352c',font:'bookish',textSize:'medium',density:'comfortable'}},
 focus:{name:'Focus',caption:'Minimal color. Clear priorities.',p:{theme:'focus',background:'#f4f5f5',accent:'#394348',textColor:'#273139',font:'basic',textSize:'medium',density:'compact'}},
 cloud:{name:'Daylight',caption:'Crisp, airy & quietly blue',p:{theme:'cloud',background:'#f5f8fc',accent:'#527398',textColor:'#273b50',font:'basic',textSize:'medium',density:'comfortable'}},
 moss:{name:'Garden',caption:'A little room to breathe',p:{theme:'moss',background:'#edf2e8',accent:'#527361',textColor:'#2f4036',font:'rounded',textSize:'medium',density:'comfortable'}},
 midnight:{name:'After hours',caption:'Soft contrast for darker days',p:{theme:'midnight',background:'#1c2229',accent:'#9bb7d4',textColor:'#edf2f6',font:'basic',textSize:'medium',density:'comfortable'}}
};
export const fonts={basic:{name:'Basic',family:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},typewriter:{name:'Typewriter',family:'"Courier New", Courier, monospace'},bookish:{name:'Bookish',family:'Georgia, "Times New Roman", serif'},rounded:{name:'Rounded',family:'ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif'}};
export const textColors=[['Ink','#30332f'],['Charcoal','#273139'],['Espresso','#44352c'],['Navy','#273b50'],['Forest','#2f4036'],['Plum','#4a354e'],['Cloud','#edf2f6'],['Cream','#f5ead8']];
const rgb=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a:string,b:string,t:number)=>'#'+rgb(a).map((v,i)=>Math.round(v*(1-t)+rgb(b)[i]*t).toString(16).padStart(2,'0')).join('');
const lum=(h:string)=>rgb(h).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
export const contrast=(a:string,b:string)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const readable=(a:string,b:string)=>{const target=lum(b)>.18?'#101820':'#ffffff';for(let i=0;i<=20;i++){const c=mix(a,target,i/20);if(contrast(c,b)>=4.5)return c;}return target;};
export function applyAppearance(p:Preferences){const bg=p.background,a=p.accent,ink=p.textColor,dark=lum(bg)<.2,focus=p.theme==='focus',surface=mix(bg,'#ffffff',dark?.065:.57),muted=readable(mix(ink,bg,.27),bg),green=readable(focus?ink:dark?'#b1c8a9':'#527361',bg),orange=readable(focus?ink:dark?'#d9bb95':'#946d48',bg);
 const values={'--canvas':bg,'--surface':surface,'--sidebar':mix(bg,dark?'#ffffff':'#20232a',.035),'--ink':ink,'--muted':muted,'--line':mix(bg,dark?'#ffffff':'#20232a',dark?.16:.13),'--accent':a,'--accent-ink':readable(a,bg),'--accent-soft':mix(bg,a,.12),'--green':green,'--green-soft':mix(bg,green,.07),'--orange':orange,'--orange-soft':mix(bg,orange,.075),'--on-accent':contrast(bg,a)>=4.5?bg:readable(bg,a),'--app-font':fonts[p.font].family,'--text-scale':String({small:.88,medium:1,large:1.16}[p.textSize]),'--settings-ink':readable(ink,surface),'--settings-muted':readable(mix(ink,surface,.25),surface)};
 for(const [status,pastel] of Object.entries({todo:'#eaf3fc',in_progress:'#ffead8',on_hold:'#fcebec',done:'#eaf5e9'})){const lane=dark?mix(bg,pastel,.12):pastel;document.documentElement.style.setProperty(`--lane-${status}-bg`,lane);document.documentElement.style.setProperty(`--lane-${status}-ink`,readable(ink,lane));}
 Object.entries(values).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));document.documentElement.style.colorScheme=dark?'dark':'light';document.body.classList.toggle('compact',p.density==='compact');document.body.classList.toggle('focus-mode',focus);document.body.dataset.textSize=p.textSize;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',bg);
}
