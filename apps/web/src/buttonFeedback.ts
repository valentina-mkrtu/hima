// One delegated listener covers existing and newly rendered controls without delaying actions.
export function installButtonFeedback(){
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const running=new WeakMap<HTMLElement,Animation>();
 document.addEventListener('click',event=>{
  if(motion.matches||!(event.target instanceof Element))return;
  const control=event.target.closest<HTMLElement>('button, .file-picker');
  if(!control||control.matches(':disabled, [aria-disabled="true"], .drag-grip')||control.closest('fieldset:disabled'))return;
  running.get(control)?.cancel();
  const animation=control.animate([{scale:'0.96'},{scale:'1'}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});
  running.set(control,animation);
 },true);
}
