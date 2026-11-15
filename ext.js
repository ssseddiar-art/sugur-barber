/* ===== ext.js: переключатель языка + новые разделы ===== */
const EXT={
 MAP_Q:'Маметова 54/1, Уральск, Казахстан', // адрес с городом И страной (иначе Google может найти другой «Уральск»)
 MAP_LL:null,              // точные координаты, например '51.2300,51.3700' — если задать, карта и маршруты будут точнее адреса
 GIS_URL:'https://2gis.kz/uralsk/geo/70000001063913045',
 IG_URL:'https://www.instagram.com/zhlmnvsr/',
 SHOW_PLACEHOLDERS:true,   // false = раздел «Работы» покажет только пары, фото которых реально загружены
 ABOUT_PHOTO:'img/barber.jpg', // положите фото в public/img/ — блок «Мастер» покажет его
 ABOUT_YEARS:null,          // например 5 — тогда появится строка «5 лет опыта»
 GALLERY:[ // фото кладите в public/gallery/ под этими именами
  {b:'gallery/1-before.jpg',a:'gallery/1-after.jpg',c:{ru:'Стрижка + укладка',kk:'Шаш қию + сәндеу',en:'Haircut + styling'}},
  {b:'gallery/2-before.jpg',a:'gallery/2-after.jpg',c:{ru:'Борода и окантовка',kk:'Сақал және контур',en:'Beard and edging'}}
 ]
};
const L=o=>o[LANG]||o.ru;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MARK='<svg viewBox="770 244 460 460" aria-hidden="true"><use href="#mark"/></svg>';
const X={
 work:{h:{ru:'Работы',kk:'Жұмыстар',en:'Work'},n:{ru:'Двигайте ползунок: до и после',kk:'Жүгірткіні жылжытыңыз: бұрын және кейін',en:'Drag the slider: before and after'},b:{ru:'До',kk:'Бұрын',en:'Before'},a:{ru:'После',kk:'Кейін',en:'After'},s:{ru:'Фото скоро',kk:'Фото жақында',en:'Photo coming soon'},al:{ru:'Сравнение до и после',kk:'Бұрын және кейін салыстыру',en:'Before and after comparison'}},
 about:{h:{ru:'Мастер',kk:'Шебер',en:'Barber'},
  p:[{ru:'Сүгүр — барбер из Уральска. Мужские и детские стрижки, борода, укладка, уход за лицом.',kk:'Сүгүр — Оралдағы барбер. Ерлер мен балалардың шашын қию, сақал, сәндеу, бет күтімі.',en:'Sügür is a barber in Uralsk. Men’s and kids’ cuts, beard, styling and face care.'},
     {ru:'Работаю строго по записи: вы выбираете время на сайте и приходите без очереди.',kk:'Тек жазылу бойынша жұмыс істеймін: сайтта уақытты таңдайсыз да, кезексіз келесіз.',en:'I work by appointment only: pick a time on the site and walk in without a queue.'},
     {ru:'Не уверены, какая стрижка подойдёт? Напишите в WhatsApp или Instagram до записи.',kk:'Қандай шаш үлгісі лайық екеніне сенімсізсіз бе? Жазылар алдында WhatsApp немесе Instagram-ға жазыңыз.',en:'Not sure which cut suits you? Message on WhatsApp or Instagram before booking.'}],
  y:{ru:'лет опыта',kk:'жыл тәжірибе',en:'years of experience'}},
 rev:{h:{ru:'Отзывы',kk:'Пікірлер',en:'Reviews'},empty:{ru:'Отзывов пока нет. Будьте первым.',kk:'Әзірге пікір жоқ. Бірінші болыңыз.',en:'No reviews yet. Be the first.'},
  form:{ru:'Оставить отзыв',kk:'Пікір қалдыру',en:'Leave a review'},nm:{ru:'Имя',kk:'Аты',en:'Name'},tx:{ru:'Как всё прошло?',kk:'Қалай өтті?',en:'How did it go?'},send:{ru:'Отправить',kk:'Жіберу',en:'Send'},
  ok:{ru:'Спасибо! Отзыв появится после проверки.',kk:'Рахмет! Пікір тексерілгеннен кейін жарияланады.',en:'Thanks! Your review will appear after moderation.'},
  bad:{ru:'Укажите имя, оценку и текст от 5 символов',kk:'Атыңызды, бағаңызды және кемінде 5 таңбалы мәтінді жазыңыз',en:'Add your name, a rating and at least 5 characters of text'},
  lim:{ru:'Слишком много отзывов. Попробуйте позже',kk:'Пікір тым көп. Кейінірек көріңіз',en:'Too many reviews. Please try later'},
  err:{ru:'Не удалось отправить. Попробуйте позже',kk:'Жіберу мүмкін болмады. Кейінірек көріңіз',en:'Could not send. Please try later'},
  gis:{ru:'Оставить отзыв в 2GIS →',kk:'2GIS-те пікір қалдыру →',en:'Review us on 2GIS →'},star:{ru:'Оценка',kk:'Баға',en:'Rating'}},
 faq:{h:{ru:'Вопросы',kk:'Сұрақтар',en:'FAQ'}},
 map:{r:{ru:'Маршрут в Google Maps',kk:'Google Maps маршруты',en:'Route in Google Maps'},g:{ru:'Открыть в 2GIS',kk:'2GIS-те ашу',en:'Open in 2GIS'},a:{ru:'Маршрут в Apple Maps',kk:'Apple Maps маршруты',en:'Route in Apple Maps'},tap:{ru:'Нажмите, чтобы двигать карту',kk:'Картаны жылжыту үшін басыңыз',en:'Tap to move the map'},h:{ru:'Карта',kk:'Карта',en:'Map'},t:{ru:'Карта: Маметова 54/1, Уральск',kk:'Карта: Маметова 54/1, Орал',en:'Map: Mametova 54/1, Uralsk'}}
};
function faqItems(){
 const off=[0,1,2,3,4,5,6].filter(d=>!WORK.includes(d)).map(d=>DT[LANG].FD[d]).join(', '),o=z(OPEN)+':00',c=z(CLOSE)+':00';
 const hrs={ru:off?`Работаем с ${o} до ${c}. Выходной: ${off}.`:`Работаем ежедневно с ${o} до ${c}.`,kk:off?`${o}–${c} аралығында жұмыс істейміз. Демалыс күні: ${off}.`:`Күн сайын ${o}–${c} аралығында жұмыс істейміз.`,en:off?`We are open ${o}–${c}. Day off: ${off}.`:`We are open daily ${o}–${c}.`};
 return[
 [{ru:'Как записаться?',kk:'Қалай жазылуға болады?',en:'How do I book?'},{ru:'Нажмите «Записаться», выберите услугу, день и время, укажите имя и телефон. Мастер получит запись и подтвердит её.',kk:'«Жазылу» батырмасын басып, қызмет, күн мен уақытты таңдаңыз, атыңыз бен телефоныңызды жазыңыз. Шебер жазылуды алып, растайды.',en:'Tap “Book”, choose a service, day and time, and enter your name and phone. The barber receives the booking and confirms it.'}],
 [{ru:'Когда вы работаете?',kk:'Қашан жұмыс істейсіздер?',en:'When are you open?'},hrs],
 [{ru:'Сколько длится стрижка?',kk:'Шаш қию қанша уақыт алады?',en:'How long does a haircut take?'},{ru:`Мужская и детская стрижка — ${dur(SV[0][2])}, стрижка с бородой — ${dur(SV[2][2])}. Время каждой услуги указано в прайсе.`,kk:`Ерлер мен балалар шашын қию — ${dur(SV[0][2])}, шаш қию мен сақал — ${dur(SV[2][2])}. Әр қызметтің уақыты бағалар тізімінде көрсетілген.`,en:`Men’s and kids’ haircuts take ${dur(SV[0][2])}, haircut with beard ${dur(SV[2][2])}. Each service’s time is listed in the prices.`}],
 [{ru:'Как отменить запись?',kk:'Жазылуды қалай болдырмауға болады?',en:'How do I cancel?'},{ru:'Сразу после записи в билете есть кнопка «Отменить запись». Позже напишите мастеру в WhatsApp — место освободится для других.',kk:'Жазылған бойда билетте «Жазылуды болдырмау» батырмасы болады. Кейін шеберге WhatsApp-пен жазыңыз — орын басқаларға босайды.',en:'Right after booking, your ticket has a “Cancel booking” button. Later, message the barber on WhatsApp so the slot frees up for others.'}],
 [{ru:'Что делать, если опаздываю?',kk:'Кешіксем не істеймін?',en:'What if I’m running late?'},{ru:'Напишите мастеру в WhatsApp, как только поймёте, что задерживаетесь.',kk:'Кешігетініңізді білген бойда шеберге WhatsApp-пен жазыңыз.',en:'Message the barber on WhatsApp as soon as you know you’ll be late.'}],
 [{ru:'Стрижёте детей?',kk:'Балалардың шашын қиясыздар ма?',en:'Do you cut kids’ hair?'},{ru:`Да: детская стрижка — ${fmt(SV[1][1])}, ${dur(SV[1][2])}. Для отца и сына есть комбо на одно время.`,kk:`Иә: балалар шашын қию — ${fmt(SV[1][1])}, ${dur(SV[1][2])}. Әке мен бала үшін бір уақытқа комбо бар.`,en:`Yes: a kids’ haircut is ${fmt(SV[1][1])}, ${dur(SV[1][2])}. There is also a father + son combo for one time slot.`}],
 [{ru:'Где вас найти?',kk:'Сізді қайдан табуға болады?',en:'Where are you?'},{ru:`${ADDRESS}. Кнопки с картой — в разделе «Приходи».`,kk:`${ADDRESS}. Карта батырмалары «Келіңіз» бөлімінде.`,en:`${ADDRESS}. Map buttons are in the Visit section.`}]
 ]}

/* ---------- отрисовка новых разделов ---------- */
function sec(id,n,h,body,cls){return `<section id="${id}" class="${cls||''}"><div class="sec-h"><span class="num">${n}</span><h2 class="d out">${esc(L(h))}</h2></div>${body}</section>`}
function drawWork(){
 const w=X.work;
 return sec('work','02',w.h,`<p class="xlead">${esc(L(w.n))}</p><div class="wgrid">`+EXT.GALLERY.map((g,i)=>`<figure class="wk" data-g="${i}"><div class="cmp" style="--p:50%" role="group" aria-label="${esc(L(w.al))}">
 <div class="ly af"><div class="ph">${MARK}<span>${esc(L(w.s))}</span></div><img alt="" src="${esc(g.a)}" onerror="this.remove()"></div>
 <div class="ly bf"><div class="ph">${MARK}<span>${esc(L(w.s))}</span></div><img alt="" src="${esc(g.b)}" onerror="this.remove()"></div>
 <span class="tg l">${esc(L(w.b))}</span><span class="tg r">${esc(L(w.a))}</span><i class="hd"></i>
 <input type="range" min="0" max="100" value="50" aria-label="${esc(L(w.al))}"></div><figcaption>${esc(L(g.c))}</figcaption></figure>`).join('')+'</div>');
}
function checkGallery(){
 const sec_=$('#work');if(!sec_||EXT.SHOW_PLACEHOLDERS)return;
 const figs=[...sec_.querySelectorAll('.wk')];let left=figs.length;
 figs.forEach((f,i)=>{const g=EXT.GALLERY[i];let n=0,bad=false;const done=()=>{if(++n<2)return;if(bad)f.remove();if(!sec_.querySelector('.wk'))sec_.style.display='none'};
  [g.a,g.b].forEach(u=>{const im=new Image();im.onload=done;im.onerror=()=>{bad=true;done()};im.src=u})});
}
function drawAbout(){
 const a=X.about,wa=WHATSAPP?`<a class="btn sm" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>`:'';
 const yrs=EXT.ABOUT_YEARS?`<p><b class="d" style="font-size:44px;color:var(--red)">${+EXT.ABOUT_YEARS}</b> ${esc(L(a.y))}</p>`:'';
 return sec('about','03',a.h,`<div class="about ph1" id="aboutBox"><div class="pic" id="aboutPic" hidden></div><div>${a.p.map(p=>`<p>${esc(L(p))}</p>`).join('')}${yrs}<div class="acts2">${wa}<a class="btn sm ol" href="${EXT.IG_URL}" target="_blank" rel="noopener">Instagram</a></div></div></div>`);
}
function loadAboutPhoto(){
 const pic=$('#aboutPic'),box=$('#aboutBox');if(!pic)return;
 const im=new Image();im.onload=()=>{pic.style.backgroundImage=`url("${EXT.ABOUT_PHOTO}")`;pic.hidden=false;box.classList.add('ph1')};
 im.onerror=()=>{box.classList.remove('ph1')};im.src=EXT.ABOUT_PHOTO;box.classList.remove('ph1');
}
let REVS=null;
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n)}
function drawRev(){
 const r=X.rev,list=REVS||[];
 const sum=list.length?`<div class="rsum"><b>${(list.reduce((s,x)=>s+x.rating,0)/list.length).toFixed(1)}</b><span>★ · ${list.length}</span></div>`:'';
 const items=list.length?`<div class="rlist">${list.map(x=>`<article class="rv2"><span class="st" aria-label="${x.rating}/5">${stars(x.rating)}</span><p>${esc(x.text)}</p><small>${esc(x.name)}</small></article>`).join('')}</div>`:`<p class="xlead">${esc(L(r.empty))}</p>`;
 return sec('reviews','04',r.h,`${sum}${items}<form class="rf" id="rForm" novalidate><h3>${esc(L(r.form))}</h3>
 <input id="rName" maxlength="40" autocomplete="given-name" placeholder="${esc(L(r.nm))}" aria-label="${esc(L(r.nm))}">
 <div class="stars" id="rStars" role="radiogroup" aria-label="${esc(L(r.star))}">${[1,2,3,4,5].map(i=>`<button type="button" role="radio" aria-checked="false" data-v="${i}" aria-label="${i}">★</button>`).join('')}</div>
 <textarea id="rText" maxlength="400" placeholder="${esc(L(r.tx))}" aria-label="${esc(L(r.tx))}"></textarea>
 <button class="btn" id="rGo" type="submit">${esc(L(r.send))}</button><p class="msg" id="rMsg" role="status"></p></form>
 <a class="rev-lnk" href="${EXT.GIS_URL}" target="_blank" rel="noopener">${esc(L(r.gis))}</a>`);
}
function drawFaq(){return sec('faq','05',X.faq.h,`<div class="faq">${faqItems().map(([q,a])=>`<details><summary>${esc(L(q))}</summary><p>${esc(L(a))}</p></details>`).join('')}</div>`)}
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(IOS)document.documentElement.classList.add('ios');
function drawMap(){
 const m=X.map,loc=encodeURIComponent(EXT.MAP_LL||EXT.MAP_Q),hl={kk:'kk',ru:'ru',en:'en'}[LANG]||'ru';
 const coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
 $('#mapBox').innerHTML=`<div class="cd mapcd"><h3>${esc(L(m.h))}</h3>
 <div class="mapw${coarse?' lock':''}"><iframe title="${esc(L(m.t))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="https://maps.google.com/maps?q=${loc}&hl=${hl}&z=17&output=embed"></iframe>${coarse?`<button type="button" class="maptap" aria-label="${esc(L(m.tap))}"><span>${esc(L(m.tap))}</span></button>`:''}</div>
 <div class="acts2"><a class="btn sm" href="https://www.google.com/maps/dir/?api=1&destination=${loc}" target="_blank" rel="noopener">${esc(L(m.r))}</a>${IOS?`<a class="btn sm" href="https://maps.apple.com/?daddr=${loc}&dirflg=d" target="_blank" rel="noopener">${esc(L(m.a))}</a>`:''}<a class="btn sm ol" href="${EXT.GIS_URL}" target="_blank" rel="noopener">${esc(L(m.g))}</a></div></div>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('.maptap');if(b)b.closest('.mapw').classList.remove('lock')});
function drawExt(){
 const open=[...$$('#faq details')].map(d=>d.open);
 $('#extSecs').innerHTML=drawWork()+drawAbout()+drawRev()+drawFaq();
 $$('#faq details').forEach((d,i)=>d.open=!!open[i]);
 checkGallery();loadAboutPhoto();
 if(!$('#mapBox').dataset.l||$('#mapBox').dataset.l!==LANG){drawMap();$('#mapBox').dataset.l=LANG}
}
function loadReviews(){fetch('/api/reviews').then(r=>r.ok?r.json():[]).then(j=>{REVS=Array.isArray(j)?j:[];drawExt()}).catch(()=>{REVS=[];})}

/* ---------- события (делегирование) ---------- */
document.addEventListener('input',e=>{
 const g=e.target;
 if(g.matches('.cmp input'))g.closest('.cmp').style.setProperty('--p',g.value+'%');
});
document.addEventListener('click',async e=>{
 const s=e.target.closest('#rStars button');
 if(s){const v=+s.dataset.v;$$('#rStars button').forEach(b=>{const on=+b.dataset.v<=v;b.classList.toggle('on',on);b.setAttribute('aria-checked',+b.dataset.v===v)});$('#rStars').dataset.v=v;return}
});
document.addEventListener('submit',async e=>{
 if(e.target.id!=='rForm')return;e.preventDefault();
 const r=X.rev,m=$('#rMsg'),name=$('#rName').value.trim(),text=$('#rText').value.trim(),rating=+($('#rStars').dataset.v||0);
 if(name.length<2||!rating||text.length<5){m.textContent=L(r.bad);return}
 const b=$('#rGo');b.disabled=true;
 try{const res=await fetch('/api/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,rating,text})});
  m.textContent=res.ok?L(r.ok):res.status===429?L(r.lim):res.status===400?L(r.bad):L(r.err);
  if(res.ok){$('#rName').value='';$('#rText').value='';$('#rStars').dataset.v='';$$('#rStars button').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-checked','false')})}}
 catch(x){m.textContent=L(r.err)}b.disabled=false});

/* ---------- язык ---------- */
const TN=[],AT=[];
(function collect(){
 const SKIP='script,style,#auth,#priceBox,#svcList,#dys,#slots,#hrs,#state,#contact,#sum1,#fast,#bGo,#tot,#tktDl,.stamp,#cNote,#extSecs,#mapBox,#lang';
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()&&!n.parentElement.closest(SKIP)?1:2});
 let n;while(n=w.nextNode())TN.push({n,o:n.nodeValue.trim(),l:n.nodeValue.match(/^\s*/)[0],r:n.nodeValue.match(/\s*$/)[0]});
 $$('[placeholder],[aria-label]').forEach(el=>{if(el.closest('#auth,#extSecs,#lang'))return;['placeholder','aria-label'].forEach(a=>{if(el.hasAttribute(a))AT.push({el,a,o:el.getAttribute(a)})})});
})();
function drawMq(){$$('[data-mq]').forEach(el=>{const o=el.dataset.o||(el.dataset.o=el.dataset.mq);el.innerHTML=`<span>${t(o)}</span>`.repeat(8)})}
function applyLang(l){
 if(l)LANG=l;try{localStorage.setItem('lang',LANG)}catch(e){}
 document.documentElement.lang=LANG;document.title=t('Барбер Сүгүр · Уральск');setArrays();
 TN.forEach(o=>{o.n.nodeValue=o.l+t(o.o)+o.r});AT.forEach(o=>o.el.setAttribute(o.a,t(o.o)));
 drawMq();drawPrice();drawSvcList();drawVisit();drawDays();drawSlots();refresh();drawExt();
 $('#langB').textContent={kk:'KZ',ru:'RU',en:'EN'}[LANG];
 $$('#langM button').forEach(b=>b.setAttribute('aria-checked',b.dataset.l===LANG));
}
(function(){
 const B=$('#langB'),M=$('#langM'),close=()=>{M.classList.remove('show');B.setAttribute('aria-expanded','false')};
 B.onclick=e=>{e.stopPropagation();const o=M.classList.toggle('show');B.setAttribute('aria-expanded',o)};
 M.onclick=e=>{const b=e.target.closest('button');if(!b)return;applyLang(b.dataset.l);close()};
 document.addEventListener('click',e=>{if(!e.target.closest('#lang'))close()});
 addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
applyLang();loadReviews();
