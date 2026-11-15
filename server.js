const express=require('express'),fs=require('fs'),crypto=require('crypto'),path=require('path');
const {TELEGRAM_TOKEN:TG,TELEGRAM_CHAT_ID:CHAT,WA_TOKEN,WA_PHONE_ID,SETUP_CODE,PORT=3000,DATA_DIR='.',OWNER_WA='77711616355'}=process.env;
const F=path.join(DATA_DIR,'data.json');
let D={pass:null,bookings:[]};try{D=JSON.parse(fs.readFileSync(F))}catch{}
const save=()=>fs.writeFileSync(F,JSON.stringify(D));
/* ===== те же настройки, что в public/index.html ===== */
const OPEN=10,CLOSE=20,STEP=30,WORK=[0,1,2,3,5,6]; // чт (4) — выходной
const SV=[["Мужская стрижка",4000,30],["Детская стрижка",3000,30],["Стрижка + борода",6000,60],["Чистка лица",3000,30],["Укладка / окантовка",2000,20],["Покраска волос",3000,60],["Покраска бороды",2000,30],["Стрижка + борода + чистка лица",9000,90],["Отец + сын",7000,60]];
const toMin=t=>+t.slice(0,2)*60+ +t.slice(3);
const z=n=>String(n).padStart(2,'0'),hm=m=>z(Math.floor(m/60))+':'+z(m%60);
const today=()=>new Date(Date.now()+5*36e5).toISOString().slice(0,10); // Уральск UTC+5

/* ===== уведомления ===== */
const post=(u,b,h={})=>fetch(u,{method:'POST',headers:{'content-type':'application/json',...h},body:JSON.stringify(b)}).then(r=>r.json()).catch(()=>({}));
const tg=(m,p)=>TG?post(`https://api.telegram.org/bot${TG}/${m}`,p):Promise.resolve({});
const wa=(ph,t,full)=>WA_TOKEN&&post(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`,{messaging_product:'whatsapp',to:full?ph:'7'+ph,type:'text',text:{body:t}},{Authorization:'Bearer '+WA_TOKEN});
const info=b=>`${b.svc} — ${b.price} ₸\n📅 ${b.date} в ${b.time}\n👤 ${b.name}\n📞 +7${b.phone}`;
const notify=b=>{wa(OWNER_WA,'🆕 Новая запись\n'+info(b)+'\n🕐 '+b.slots[0]+'–'+hm(toMin(b.slots[b.slots.length-1])+STEP),true);return tg('sendMessage',{chat_id:CHAT,text:'🆕 Новая запись\n'+info(b),reply_markup:{inline_keyboard:[[{text:'✅ Принять',callback_data:'y'+b.id},{text:'❌ Отклонить',callback_data:'n'+b.id}]]}})};
function setStatus(id,st){const b=D.bookings.find(x=>x.id===id);if(!b||b.status!==('pending'))return b;b.status=st;save();
 wa(b.phone,st==='confirmed'?`Барбер Сүгүр: запись подтверждена ✅\n${b.svc}, ${b.date} в ${b.time}\nУральск, Маметова 54/1`:`Барбер Сүгүр: к сожалению, запись на ${b.date} ${b.time} отклонена. Выберите другое время на сайте.`);return b}
(async function poll(off=0){ if(!TG)return;
 const r=await tg('getUpdates',{offset:off,timeout:30});
 for(const u of r.result||[]){off=u.update_id+1;
  if(u.message?.text?.startsWith('/start'))tg('sendMessage',{chat_id:u.message.chat.id,text:'Ваш chat id: '+u.message.chat.id+'\nВпишите его в TELEGRAM_CHAT_ID'});
  const c=u.callback_query;if(c&&String(c.from.id)===String(CHAT)){const st=c.data[0]==='y'?'confirmed':'declined',b=setStatus(c.data.slice(1),st);
   tg('answerCallbackQuery',{callback_query_id:c.id});
   if(b)tg('editMessageText',{chat_id:c.message.chat.id,message_id:c.message.message_id,text:(b.status==='confirmed'?'✅ Принято\n':'❌ Отклонено\n')+info(b)})}}
 setTimeout(()=>poll(off),r.result?0:5000)})();

/* ===== публичное API ===== */
const app=express();app.set('trust proxy',1);app.use(express.json({limit:'20kb'}));
/* ===== аккаунты клиентов ===== */
D.users=D.users||[];D.csess=D.csess||{};
const LG=/^[a-z0-9_.]{3,24}$/i,ADMIN_USER=(process.env.ADMIN_USER||'zhlmnvsr').toLowerCase();
const thr=k=>{const f=fails.get(k)||{n:0,t:Date.now()};if(Date.now()-f.t>6e5){f.n=0;f.t=Date.now()}fails.set(k,f);return f};
const uauth=(q,r,n)=>{const l=D.csess[ck(q).c];const u=l&&D.users.find(x=>x.login===l);u?(q.user=u,n()):r.sendStatus(401)};
const oauth=(q,r,n)=>{const l=D.csess[ck(q).c];q.user=(l&&D.users.find(x=>x.login===l))||null;n()};
const ulogin=(q,r,l)=>{const t=crypto.randomBytes(24).toString('hex');D.csess[t]=l;save();r.setHeader('Set-Cookie',`c=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${q.secure?'; Secure':''}`);r.json({})};
app.post('/api/user/register',(q,r)=>r.sendStatus(403)); // регистрация клиентов отключена
app.post('/api/user/login',(q,r)=>{return r.sendStatus(403);const f=thr('u'+q.ip);if(f.n>=8)return r.sendStatus(429);
 const{login,password}=q.body||{},u=typeof login==='string'&&D.users.find(x=>x.login===login.toLowerCase());
 if(u&&typeof password==='string'&&crypto.timingSafeEqual(Buffer.from(hash(password,u.s)),Buffer.from(u.h)))return ulogin(q,r,u.login);
 f.n++;r.sendStatus(401)});
app.get('/api/user/me',uauth,(q,r)=>{const u=q.user;r.json({login:u.login,name:u.name,phone:u.phone,bookings:D.bookings.filter(b=>b.login===u.login).reverse().map(b=>({svc:b.svc,price:b.price,date:b.date,time:b.time,status:b.status}))})});
app.post('/api/user/logout',(q,r)=>{delete D.csess[ck(q).c];save();r.json({})});
const busy=()=>{const o={};D.bookings.filter(b=>b.status!=='declined'&&b.status!=='cancelled').forEach(b=>(o[b.date]=o[b.date]||[]).push(...b.slots));return o};
app.get('/api/busy',(q,r)=>r.json(busy()));
app.post('/api/booking/:id/cancel',(q,r)=>{const b=D.bookings.find(x=>x.id===q.params.id);if(!b)return r.sendStatus(404);
 if(b.status==='cancelled')return r.json({ok:true});if(b.status!=='pending'&&b.status!=='confirmed')return r.sendStatus(409);
 b.status='cancelled';save();const t='❌ Клиент отменил запись\n'+info(b)+'\n🕐 '+b.slots[0];
 wa(OWNER_WA,t,true);tg('sendMessage',{chat_id:CHAT,text:t});r.json({ok:true})});
app.get('/api/booking/:id',(q,r)=>{const b=D.bookings.find(x=>x.id===q.params.id);b?r.json({status:b.status}):r.sendStatus(404)});
app.post('/api/book',oauth,(q,r)=>{
 const gf=thr('b'+q.ip);if(gf.n>=15)return r.sendStatus(429);
 const{svc,date,time,name,phone}=q.body||{},s=SV[svc];
 if(!s||!/^\d{4}-\d\d-\d\d$/.test(date)||!/^\d\d:\d\d$/.test(time)||typeof name!=='string'||name.trim().length<2||!/^\d{10}$/.test(phone)||date<today())return r.sendStatus(400);
 const need=Math.ceil(s[2]/STEP),[h,m]=time.split(':').map(Number),st=h*60+m;
 if(!WORK.includes(new Date(date+'T00:00:00Z').getUTCDay())||st%STEP||st<OPEN*60||st+need*STEP>CLOSE*60)return r.sendStatus(400);
 const slots=[...Array(need)].map((_,i)=>hm(st+i*STEP));
 if(slots.some(x=>(busy()[date]||[]).includes(x)))return r.sendStatus(409);
 if(D.bookings.filter(b=>b.phone===phone&&b.status==='pending').length>=3)return r.sendStatus(429);
 const b={id:crypto.randomBytes(8).toString('hex'),svc:s[0],price:s[1],min:s[2],date,time,slots,name:name.trim().slice(0,60),phone,status:'pending',login:q.user?q.user.login:null,at:Date.now()};
 gf.n++;D.bookings.push(b);save();notify(b);r.json({id:b.id})});

/* ===== админка ===== */
const sess=new Map(),fails=new Map();
const hash=(p,s)=>crypto.scryptSync(p,s,32).toString('hex');
{const s0=crypto.randomBytes(16).toString('hex');D.pass={s:s0,h:hash(process.env.ADMIN_PASSWORD||'Sugur2008',s0)};save()} /* пароль по умолчанию Sugur2008; лучше задать ADMIN_PASSWORD в окружении */
const ck=q=>Object.fromEntries((q.headers.cookie||'').split(/;\s*/).map(x=>x.split('=')));
const auth=(q,r,n)=>sess.has(ck(q).s)?n():r.sendStatus(401);
const login=(q,r)=>{const t=crypto.randomBytes(24).toString('hex');sess.set(t,1);r.setHeader('Set-Cookie',`s=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${q.secure?'; Secure':''}`);r.json({})};
app.get('/api/admin/state',(q,r)=>r.json({setup:!!D.pass,in:sess.has(ck(q).s)}));
app.post('/api/admin/setup',(q,r)=>{const{password:p,code}=q.body||{};
 if(D.pass||!SETUP_CODE||code!==SETUP_CODE||String((q.body||{}).username||'').toLowerCase()!==ADMIN_USER)return r.sendStatus(403);
 if(typeof p!=='string'||p.length<8)return r.sendStatus(400);
 const s=crypto.randomBytes(16).toString('hex');D.pass={s,h:hash(p,s)};save();login(q,r)});
app.post('/api/admin/login',(q,r)=>{const f=fails.get(q.ip)||{n:0,t:Date.now()};if(Date.now()-f.t>6e5){f.n=0;f.t=Date.now()}
 if(f.n>=5)return r.sendStatus(429);
 const p=String((q.body||{}).password||''),un=String((q.body||{}).username||'').toLowerCase()===ADMIN_USER;
 if(D.pass&&crypto.timingSafeEqual(Buffer.from(hash(p,D.pass.s)),Buffer.from(D.pass.h))&&un)return login(q,r);
 f.n++;fails.set(q.ip,f);r.sendStatus(401)});
app.post('/api/admin/logout',auth,(q,r)=>{sess.delete(ck(q).s);r.json({})});
app.get('/api/admin/list',auth,(q,r)=>r.json([...D.bookings].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))));
app.post('/api/admin/status',auth,(q,r)=>{const{id,status}=q.body||{};if(!['confirmed','declined','arrived'].includes(status))return r.sendStatus(400);
 const b=D.bookings.find(x=>x.id===id);if(!b)return r.sendStatus(404);
 if(status==='arrived'){if(b.status!=='declined'&&b.status!=='cancelled'){b.status='arrived';save()}}
 else if(b.status==='pending')setStatus(id,status);else if(status==='declined'&&b.status!=='arrived'){b.status='declined';save()}
 r.json({})});
app.delete('/api/admin/booking/:id',auth,(q,r)=>{const i=D.bookings.findIndex(x=>x.id===q.params.id);if(i<0)return r.sendStatus(404);D.bookings.splice(i,1);save();r.json({ok:true})});
/* ===== отзывы ===== */
D.reviews=D.reviews||[];
const cleanT=(v,n)=>String(v||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
app.get('/api/reviews',(q,r)=>r.json(D.reviews.filter(x=>x.approved).sort((a,b)=>b.at-a.at).slice(0,50).map(x=>({name:x.name,rating:x.rating,text:x.text,at:x.at}))));
app.post('/api/review',(q,r)=>{const gf=thr('r'+q.ip);if(gf.n>=3)return r.sendStatus(429);
 const b=q.body||{},name=cleanT(b.name,40),text=cleanT(b.text,400),rating=Number(b.rating);
 if(name.length<2||text.length<5||!Number.isInteger(rating)||rating<1||rating>5)return r.sendStatus(400);
 const v={id:crypto.randomBytes(8).toString('hex'),name,rating,text,approved:false,at:Date.now()};gf.n++;D.reviews.push(v);save();
 const t='⭐ Новый отзыв на проверку: '+rating+'/5\n'+name+': '+text+'\nОдобрить: /admin';wa(OWNER_WA,t,true);tg('sendMessage',{chat_id:CHAT,text:t});r.json({ok:true})});
app.get('/api/admin/reviews',auth,(q,r)=>r.json([...D.reviews].sort((a,b)=>b.at-a.at)));
app.post('/api/admin/review',auth,(q,r)=>{const{id,approved}=q.body||{},v=D.reviews.find(x=>x.id===id);if(!v||typeof approved!=='boolean')return r.sendStatus(404);v.approved=approved;save();r.json({})});
app.delete('/api/admin/review/:id',auth,(q,r)=>{const i=D.reviews.findIndex(x=>x.id===q.params.id);if(i<0)return r.sendStatus(404);D.reviews.splice(i,1);save();r.json({ok:true})});
app.get('/admin',(q,r)=>r.sendFile(path.join(__dirname,'public/admin.html')));
app.use(express.static(path.join(__dirname,'public')));
app.listen(PORT,()=>console.log('http://localhost:'+PORT));
