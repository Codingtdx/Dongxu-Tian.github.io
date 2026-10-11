'use strict';
const {translations,research,profile,renderResearchHTML,renderPublicationsHTML,renderEducationHTML,renderContactHTML,renderScholarHTML}=siteContent;
let language='en';
try{if(localStorage.getItem('dt-language')==='zh')language='zh';}catch{}
let activeFilter='all';
const menuButton=document.getElementById('menu-toggle');
const mobileNav=document.getElementById('mobile-nav');
const desktopMedia=window.matchMedia('(min-width: 821px)');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

const dialog=document.createElement('dialog');
dialog.id='figure-dialog';dialog.className='figure-dialog';
dialog.setAttribute('aria-labelledby','figure-title');
dialog.innerHTML='<div class="figure-dialog-header"><h2 id="figure-title"></h2><button id="figure-close" aria-label="Close figure">×</button></div><div class="figure-dialog-image"><img id="figure-full" alt=""></div><div class="figure-dialog-footer"><p id="figure-note"></p><a id="figure-original" target="_blank" rel="noopener noreferrer"></a></div>';
document.body.append(dialog);

let figureTrigger=null;
function openFigure(id,trigger){
 const item=research.find(r=>r.id===id);if(!item||!item.figure||dialog.open)return;
 figureTrigger=trigger;
 const copy=item[language];
 document.getElementById('figure-title').textContent=copy.title;
 const img=document.getElementById('figure-full');img.src=item.figure.preview;img.alt=copy.alt;
 document.getElementById('figure-note').textContent=translations[language].figureNote;
 const original=document.getElementById('figure-original');original.href=item.figure.original||item.figure.preview;original.textContent=translations[language].fullResolution;
 dialog.showModal();document.body.classList.add('modal-open');
 if(!reducedMotion.matches&&dialog.animate)dialog.animate([{transform:'translateY(10px)'},{transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
}
function enhanceFigureLinks(){
 document.querySelectorAll('[data-figure]').forEach(link=>{if(link.dataset.enhanced)return;link.dataset.enhanced='true';link.addEventListener('click',event=>{
  // Retain the original image link for unsupported browsers and modified clicks.
  if(typeof dialog.showModal!=='function'||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();openFigure(link.dataset.figure,link);
 });
  if(typeof dialog.showModal==='function')link.setAttribute('aria-haspopup','dialog');
  link.addEventListener('keydown',event=>{
   if((event.key!==' '&&event.key!=='Spacebar')||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||typeof dialog.showModal!=='function')return;
   event.preventDefault();if(!event.repeat)openFigure(link.dataset.figure,link);
  });
 });
}
document.getElementById('figure-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
 if(event.target!==dialog)return;
 const r=dialog.getBoundingClientRect();
 if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
dialog.addEventListener('close',()=>{
 document.body.classList.remove('modal-open');
 if(figureTrigger&&figureTrigger.isConnected)figureTrigger.focus({preventScroll:true});
 figureTrigger=null;
});

function menuIsOpen(){return menuButton.getAttribute('aria-expanded')==='true';}
function closeMenu({focusTarget=null}={}){
 if(!menuIsOpen())return;
 mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');
 menuButton.setAttribute('aria-label',translations[language].menuOpen);
 if(focusTarget)focusTarget.focus({preventScroll:true});
}
menuButton.addEventListener('click',()=>{
 if(menuIsOpen()){closeMenu({focusTarget:menuButton});return;}
 mobileNav.hidden=false;menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label',translations[language].menuClose);
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&menuIsOpen()&&!dialog.open){event.preventDefault();closeMenu({focusTarget:menuButton});}
});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
 const target=document.getElementById(link.hash.slice(1));if(!target)return;
 if(mobileNav.contains(link))closeMenu();
 target.focus({preventScroll:true});
}));
mobileNav.addEventListener('focusout',()=>requestAnimationFrame(()=>{
 if(menuIsOpen()&&!mobileNav.contains(document.activeElement)&&document.activeElement!==menuButton)closeMenu();
}));
desktopMedia.addEventListener('change',event=>{
 const active=document.activeElement;
 if(event.matches){
  const needsFocus=mobileNav.contains(active)||active===menuButton;
  const desktopLink=active.hash?document.querySelector(`.desktop-nav a[href="${active.hash}"]`):null;
  closeMenu();
  if(needsFocus)(desktopLink||document.querySelector('.wordmark')).focus({preventScroll:true});
 }else if(document.querySelector('.desktop-nav').contains(active))menuButton.focus({preventScroll:true});
});

function applyFilter(){
 let count=0;
 document.querySelectorAll('.publication-item').forEach(item=>{
  const visible=activeFilter==='all'||item.dataset.firstAuthor==='true';item.hidden=!visible;if(visible)count++;
 });
 document.querySelectorAll('[data-filter]').forEach(button=>{
  const active=button.dataset.filter===activeFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 });
 document.getElementById('publication-count').textContent=siteContent.publicationCount(count,language);
 observeReveals();
}
function applyLanguage(){
 const t=translations[language];
 document.documentElement.lang=language==='en'?'en':'zh-CN';
 document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(key==='heroStatement')el.innerHTML=t[key];else el.textContent=t[key];});
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t[el.dataset.i18nAria]));
 document.querySelectorAll('[data-profile]').forEach(el=>{el.textContent=profile[el.dataset.profile][language];});
 document.querySelector('.wordmark').setAttribute('aria-label',profile.name[language]+', home');
 document.title=profile.pageTitle[language];
 document.querySelector('meta[name="description"]').content=profile.description[language];
 document.querySelector('meta[property="og:title"]').content=profile.pageTitle[language];
 document.querySelector('meta[property="og:description"]').content=profile.socialDescription?.[language]||profile.description[language];
 const toggle=document.getElementById('language-toggle');toggle.textContent=language==='en'?'中文':'EN';toggle.setAttribute('aria-label',language==='en'?'Switch to Chinese':'Switch to English');
 document.querySelector('.filter-group').setAttribute('aria-label',t.allLabel);
 menuButton.setAttribute('aria-label',t[menuIsOpen()?'menuClose':'menuOpen']);
 document.getElementById('figure-close').setAttribute('aria-label',t.close);
 document.getElementById('research-list').innerHTML=renderResearchHTML(language);
 document.getElementById('publication-list').innerHTML=renderPublicationsHTML(language);
 document.getElementById('education-list').innerHTML=renderEducationHTML(language);
 document.getElementById('contact-links').innerHTML=renderContactHTML(language);
 document.getElementById('scholar-slot').innerHTML=renderScholarHTML(language);
 enhanceFigureLinks();applyFilter();
 try{localStorage.setItem('dt-language',language);}catch{}
}
document.getElementById('language-toggle').addEventListener('click',()=>{language=language==='en'?'zh':'en';applyLanguage();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;applyFilter();}));

// Core content is static and remains visible if enhancements fail or motion is reduced.
const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 entries.forEach(({target,isIntersecting})=>{
  if(!isIntersecting)return;
  revealObserver.unobserve(target);target.dataset.revealed='true';
  if(reducedMotion.matches||!target.animate)return;
  const figure=target.dataset.motion==='figure';const hero=target.classList.contains('hero-copy')||target.classList.contains('hero-profile');
  target.animate([{transform:figure?'translateY(8px)':'translateY(12px)'},{transform:'translateY(0)'}],{duration:hero?620:420,easing:'cubic-bezier(.22,1,.36,1)'});
 });
},{threshold:.08,rootMargin:'0px 0px -24px 0px'}):null;
function observeReveals(){
 if(!revealObserver)return;revealObserver.disconnect();
 document.querySelectorAll('.reveal:not([data-revealed]):not([hidden])').forEach(el=>revealObserver.observe(el));
}
reducedMotion.addEventListener('change',event=>{if(event.matches&&document.getAnimations)document.getAnimations().forEach(animation=>animation.cancel());});
const navLinks=[...document.querySelectorAll('.desktop-nav a,.mobile-nav a')];
const sections=[...document.querySelectorAll('main>section[id]')];
const progress=document.querySelector('.header-progress');let scrollFrame=0;
function updateNavigation(){
 scrollFrame=0;const y=window.scrollY;document.querySelector('.site-header').classList.toggle('at-top',y<8);const range=document.documentElement.scrollHeight-window.innerHeight;
 progress.style.transform=`scaleX(${range>0?Math.min(1,Math.max(0,y/range)):0})`;
 let current='top';const anchor=Math.max(window.innerWidth<=820?94:112,window.innerHeight*.3);
 sections.forEach(section=>{if(section.getBoundingClientRect().top<=anchor)current=section.id;});
 if(range>0&&range-y<4)current='contact';
 navLinks.forEach(link=>{if(link.hash===`#${current}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
function requestNavigationUpdate(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateNavigation);}
window.addEventListener('scroll',requestNavigationUpdate,{passive:true});window.addEventListener('resize',requestNavigationUpdate);
if('ResizeObserver' in window)new ResizeObserver(requestNavigationUpdate).observe(document.body);
document.getElementById('year').textContent=new Date().getFullYear();
applyLanguage();
document.querySelectorAll('[data-enhancement]').forEach(el=>{el.hidden=false;});
updateNavigation();
