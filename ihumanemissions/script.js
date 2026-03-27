/* =============================================
   International Humanitarian Missions (IHM)
   script.js — Shared Scripts
   ============================================= */
'use strict';

const $ = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];

/* ---- Navbar ---- */
(function(){
  const nav = $('#navbar');
  const ham = $('#hamburger');
  const links = $('#navLinks');
  if(!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 56);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  ham?.addEventListener('click', () => {
    ham.classList.toggle('open');
    links?.classList.toggle('open');
  });

  $$('a', links||document).forEach(a => {
    a.addEventListener('click', () => {
      ham?.classList.remove('open');
      links?.classList.remove('open');
    });
  });

  document.addEventListener('click', e => {
    if(!nav.contains(e.target)){
      ham?.classList.remove('open');
      links?.classList.remove('open');
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key==='Escape'){
      ham?.classList.remove('open');
      links?.classList.remove('open');
    }
  });

  // Active link by path
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if(href && (href === path || (path==='' && href==='index.html'))) a.classList.add('active');
  });
})();

/* ---- Smooth scroll for anchor links ---- */
(function(){
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if(!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({top, behavior:'smooth'});
    });
  });
})();

/* ---- Scroll reveal ---- */
(function(){
  const els = $$('.reveal');
  if(!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        const delay = parseInt(e.target.dataset.delay||0);
        setTimeout(()=>e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.1, rootMargin:'0px 0px -36px 0px'});
  els.forEach(el => obs.observe(el));
})();

/* ---- Animated counters ---- */
function animateCount(el, target, duration=1600){
  let start=0;
  const step = target/(duration/16);
  const t = setInterval(()=>{
    start = Math.min(start+step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if(start>=target) clearInterval(t);
  },16);
}

(function(){
  const nums = $$('[data-count]');
  if(!nums.length) return;
  let done = false;
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !done){
        done=true;
        nums.forEach((el,i)=>{
          setTimeout(()=>animateCount(el, parseInt(el.dataset.count)), i*80);
        });
      }
    });
  },{threshold:0.4});
  const wrap = nums[0].closest('section') || document.body;
  obs.observe(wrap);
})();

/* ---- Back to top ---- */
(function(){
  const btn = $('#backToTop');
  if(!btn) return;
  window.addEventListener('scroll',()=>btn.classList.toggle('visible',window.scrollY>400),{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ---- Stories slider ---- */
(function(){
  const cards = $$('.story-card-ih');
  const dots  = $$('.snav-dot');
  const prev  = $('#storyPrev');
  const next  = $('#storyNext');
  if(!cards.length) return;

  let cur=0, timer;

  function show(i){
    cards.forEach(c=>c.classList.remove('active'));
    dots.forEach(d=>d.classList.remove('active'));
    cur = (i+cards.length)%cards.length;
    cards[cur].classList.add('active');
    dots[cur]?.classList.add('active');
  }

  const reset = () => { clearInterval(timer); timer=setInterval(()=>show(cur+1),5000); };

  prev?.addEventListener('click',()=>{show(cur-1);reset();});
  next?.addEventListener('click',()=>{show(cur+1);reset();});
  dots.forEach(d=>d.addEventListener('click',()=>{show(parseInt(d.dataset.index));reset();}));

  // swipe
  let sx=0;
  const sl = $('#storiesSlider');
  sl?.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;},{passive:true});
  sl?.addEventListener('touchend',e=>{
    const d=sx-e.changedTouches[0].clientX;
    if(Math.abs(d)>45){d>0?show(cur+1):show(cur-1);reset();}
  },{passive:true});

  reset();
})();

/* ---- Contact form ---- */
(function(){
  const form=$('#contactForm');
  if(!form) return;

  const rules={
    firstName:{ el:$('#firstName'), err:$('#firstNameErr'), fn:v=>v.trim().length>=2?'':'Enter your first name.' },
    lastName: { el:$('#lastName'),  err:$('#lastNameErr'),  fn:v=>v.trim().length>=2?'':'Enter your last name.' },
    email:    { el:$('#email'),     err:$('#emailErr'),     fn:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())?'':'Enter a valid email.' },
    message:  { el:$('#message'),   err:$('#messageErr'),   fn:v=>v.trim().length>=10?'':'Message must be at least 10 characters.' },
  };

  Object.values(rules).forEach(({el,err,fn})=>{
    el?.addEventListener('blur',()=>{ const m=fn(el.value); err.textContent=m; el.classList.toggle('err',!!m); });
    el?.addEventListener('input',()=>{ if(el.classList.contains('err')){ const m=fn(el.value); err.textContent=m; el.classList.toggle('err',!!m); } });
  });

  form.addEventListener('submit', e=>{
    e.preventDefault();
    let ok=true;
    Object.values(rules).forEach(({el,err,fn})=>{ const m=fn(el.value); err.textContent=m; el.classList.toggle('err',!!m); if(m)ok=false; });
    if(!ok) return;

    /* Validation passed — show sending state then submit to formsubmit.co */
    const btn=$('#submitBtn');
    const bt=$('.btn-text',btn), bl=$('.btn-loader',btn);
    btn.disabled=true; bt.style.display='none'; bl.style.display='inline';
    form.submit();
  });
})();

/* ---- Tab switcher (generic) ---- */
function initTabs(tabSelector, panelSelector){
  const tabs   = $$(tabSelector);
  const panels = $$(panelSelector);
  if(!tabs.length) return;
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      target?.classList.add('active');
    });
  });
}

// Resources tabs
initTabs('.rtab','[id^="res-"]');

// Practice tabs
initTabs('.ptab','[id^="practice-"]');

/* ---- Parallax on hero shapes ---- */
(function(){
  const shapes = $$('.hshape');
  if(!shapes.length||window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;
    shapes.forEach((s,i)=>{ s.style.transform=`translateY(${y*(0.03+i*0.015)}px)`; });
  },{passive:true});
})();

/* ---- Page load fade in ---- */
document.body.style.opacity='0';
document.body.style.transition='opacity 0.35s ease';
window.addEventListener('load',()=>{ document.body.style.opacity='1'; });
if(document.readyState==='complete') document.body.style.opacity='1';

/* ---- Skip link ---- */
(function(){
  const skip=document.createElement('a');
  skip.href='#main'; skip.textContent='Skip to content';
  skip.className='skip-link';
  document.body.prepend(skip);
})();

console.log('%c International Humanitarian Missions 🌿','color:#1b7a4a;font-size:16px;font-weight:800;');
console.log('%c Teaching English. Changing Lives. — Tonlé Sap, Cambodia','color:#f59e0b;font-size:11px;');
