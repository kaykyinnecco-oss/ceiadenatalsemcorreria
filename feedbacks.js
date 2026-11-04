/* Carrossel nativo: uma única instância de cada print, sem clones. */
'use strict';
window.initCeiaFeedbacks = ({ C, openDialog }) => {
  const section=document.querySelector('#depoimentos'),viewport=document.querySelector('#feedback-window'),belt=document.querySelector('#feedback-belt');
  const dialog=document.querySelector('#feedback-dialog'),fullImage=document.querySelector('#feedback-full-image'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const seen=new Set(),items=(C.SHOW_TESTIMONIALS?(C.TESTIMONIALS||[]):[]).filter(item=>{const key=new URL(item.thumb,location.href).href;if(seen.has(key))return false;seen.add(key);return true;});
  const reasons=new Set(),buttons=[];let timer=null,resumeTimer=null,settleTimer=null,index=0,galleryIndex=0,autoScrolling=false,autoTarget=0,keyboardMode=false,held=false,drag=null,dragged=false;
  if(!items.length){section.remove();dialog.remove();return{getState:()=>({count:0,unique:0,clones:0,active:false,paused:true})};}
  section.hidden=false;section.querySelector('h2').textContent=items.length===1?'Feedback de quem já recebeu':'Feedbacks de quem já recebeu';
  const maxScroll=()=>Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  const offset=i=>Math.max(0,buttons[i].offsetLeft-belt.offsetLeft);
  function stop(){clearTimeout(timer);timer=null;}
  function schedule(){stop();if(motion.matches||items.length<2||reasons.size||document.hidden)return;timer=setTimeout(()=>{timer=null;advance();schedule();},3500);}
  function pause(reason){reasons.add(reason);stop();clearTimeout(resumeTimer);if(autoScrolling){autoScrolling=false;clearTimeout(settleTimer);viewport.scrollTo({left:viewport.scrollLeft,behavior:'instant'});}}
  function resumeLater(reason){
    if(reason)reasons.delete(reason);clearTimeout(resumeTimer);
    resumeTimer=setTimeout(()=>{if(!held){reasons.delete('interaction');schedule();}},3000);
  }
  function scrollToCard(next){
    index=next;autoScrolling=true;clearTimeout(settleTimer);autoTarget=Math.min(offset(next),maxScroll());
    viewport.scrollTo({left:autoTarget,behavior:motion.matches?'instant':'smooth'});
    settleTimer=setTimeout(()=>{if(Math.abs(viewport.scrollLeft-autoTarget)<2)autoScrolling=false;},900);
  }
  function advance(){
    if(maxScroll()<1)return;
    const next=viewport.scrollLeft>=maxScroll()-2?0:buttons.findIndex((_,i)=>offset(i)>viewport.scrollLeft+2);
    scrollToCard(next<0?0:next);
  }
  function showImage(next){
    galleryIndex=(next+items.length)%items.length;const item=items[galleryIndex];
    fullImage.width=item.fullWidth;fullImage.height=item.fullHeight;fullImage.loading='eager';fullImage.src=item.full;
    document.querySelector('#feedback-position').textContent=`${galleryIndex+1} / ${items.length}`;dialog.scrollTop=0;
  }
  items.forEach((item,i)=>{
    const button=document.createElement('button');button.type='button';button.className='feedback-card';button.dataset.feedbackIndex=i;button.dataset.unique='true';button.setAttribute('aria-label',`Ampliar feedback ${i+1}`);
    const image=document.createElement('img');image.src=item.thumb;image.width=item.width;image.height=item.height;image.loading='lazy';image.decoding='async';image.draggable=false;image.alt='Conversa de WhatsApp com feedback de cliente';
    button.appendChild(image);button.addEventListener('click',()=>{pause('lightbox');galleryIndex=i;showImage(i);openDialog(dialog);});belt.appendChild(button);buttons.push(button);
  });
  viewport.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')pause('hover');});
  viewport.addEventListener('pointerleave',()=>resumeLater('hover'));
  viewport.addEventListener('pointerdown',e=>{held=true;pause('interaction');drag={x:e.clientX,left:viewport.scrollLeft,mouse:e.pointerType==='mouse'};dragged=false;},{passive:true});
  viewport.addEventListener('pointermove',e=>{
    if(!drag?.mouse||!held)return;const dx=e.clientX-drag.x;
    if(Math.abs(dx)>4){dragged=true;viewport.setPointerCapture?.(e.pointerId);e.preventDefault();viewport.scrollLeft=drag.left-dx;}
  });
  function release(){if(!held)return;held=false;drag=null;resumeLater();setTimeout(()=>{dragged=false;},0);}
  addEventListener('pointerup',release,{passive:true});addEventListener('pointercancel',release,{passive:true});
  viewport.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();}},true);
  viewport.addEventListener('wheel',()=>{autoScrolling=false;pause('interaction');resumeLater();},{passive:true});
  viewport.addEventListener('scroll',()=>{
    if(autoScrolling)return;
    index=viewport.scrollLeft>=maxScroll()-2?items.length-1:buttons.reduce((best,_,i)=>Math.abs(offset(i)-viewport.scrollLeft)<Math.abs(offset(best)-viewport.scrollLeft)?i:best,0);
    pause('interaction');if(!held)resumeLater();
  },{passive:true});
  viewport.addEventListener('scrollend',()=>{if(autoScrolling&&Math.abs(viewport.scrollLeft-autoTarget)<2)autoScrolling=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Tab')keyboardMode=true;});
  document.addEventListener('pointerdown',()=>{keyboardMode=false;reasons.delete('focus');},{passive:true});
  viewport.addEventListener('focusin',()=>{if(keyboardMode)pause('focus');});
  viewport.addEventListener('focusout',e=>{if(!viewport.contains(e.relatedTarget))resumeLater('focus');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('hidden');else resumeLater('hidden');});
  document.querySelector('#feedback-lightbox-prev').addEventListener('click',()=>showImage(galleryIndex-1));
  document.querySelector('#feedback-lightbox-next').addEventListener('click',()=>showImage(galleryIndex+1));
  document.querySelector('#feedback-lightbox-prev').hidden=items.length<2;document.querySelector('#feedback-lightbox-next').hidden=items.length<2;
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showImage(galleryIndex+(e.key==='ArrowRight'?1:-1));}});
  dialog.addEventListener('close',()=>{fullImage.removeAttribute('src');scrollToCard(galleryIndex);reasons.delete('lightbox');buttons[galleryIndex]?.focus({preventScroll:true});resumeLater();});
  motion.addEventListener('change',()=>{stop();clearTimeout(resumeTimer);if(!motion.matches)schedule();});
  schedule();
  return{getState:()=>({count:items.length,unique:buttons.length,clones:0,active:timer!==null,paused:reasons.size>0,reasons:[...reasons],index,slide:index,galleryIndex,galleryOpen:dialog.open,interval:3500})};
};
