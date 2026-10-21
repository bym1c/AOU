const mins=s=>{const[a,b]=s.split(":");return +a*60+ +b};
const ev=E.map(([d,a,b,t,l])=>({s:Date.parse(DATE[d]+"T00:00:00Z")/1000+mins(a)*60,e:Date.parse(DATE[d]+"T00:00:00Z")/1000+mins(b)*60,a,b,t,l}));
/* للتجربة: افتح الملف مع ?t=2026-10-26T10:20 لمحاكاة وقت معين */
const q=new URLSearchParams(location.search).get("t");
const off=q?Date.parse(q+":00Z")-(Date.now()+144e5):0;
const nowM=()=>(Date.now()+off+144e5)/1000; // توقيت مسقط UTC+4
const $=id=>document.getElementById(id), sc=["ev","lg","cp"].map($);
const mk=(c,l,s="")=>`<div ${s}class="${c}${l.light?" dk":""}"><img src="${l.uri}" alt=""></div>`;
$("im").style.backgroundImage=`url(${BUILDING})`;
$("co").innerHTML=LOGOS.map((l,i)=>mk("t",l,`style="animation-delay:${i*.12}s" `)).join("");
$("st").innerHTML=LOGOS.map(l=>mk("lc",l)).join("");
$("dt").innerHTML=LOGOS.map(()=>"<i></i>").join("");
$("lg").innerHTML=LOGOS.map((l,i)=>mk("big",l,`style="--i:${i}" `)).join("");
const lgd=s=>$("lg").style.setProperty("--d",s+"s");lgd(LOGO_EACH);
function setFly(){const vm=Math.min(innerWidth,innerHeight)/100,t=$("co").children;
 [...$("lg").children].forEach((b,i)=>{const r=t[i].getBoundingClientRect();
  b.style.setProperty("--dx",(r.left+r.width/2-innerWidth/2)+"px");b.style.setProperty("--dy",(r.top+r.height/2-innerHeight/2)+"px");b.style.setProperty("--sc",r.width/(62*vm))})}
const UNI=Math.max(0,LOGOS.findIndex(l=>l.light));let cl=[0],ci=0;
function rot(){const k=cl[ci++%cl.length];[...$("st").children,...$("dt").children].forEach((e,j)=>e.classList.toggle("act",j%LOGOS.length===k))}
function setCp(multi){cl=multi?LOGOS.map((_,i)=>i):[UNI];ci=0;rot()}
setInterval(rot,3200);
let cur="";
function show(id,key,fn){ // يعيد تشغيل الحركة عند تغيّر المشهد أو الحدث
  if(cur===key)return; cur=key; sc.forEach(s=>s.classList.remove("on"));document.body.classList.toggle("lg",id==="lg"); void document.body.offsetWidth;
  if(fn)fn(); $(id).classList.add("on");}
function fill(e,next){
  const ev$=$("ev"); ev$.classList.toggle("next",next);
  const brk=!next&&/^(استراحة|الغداء)/.test(e.t);ev$.classList.toggle("brk",brk);
  $("lb").textContent=next?"الحدث القادم":brk?"وقت راحة":"يحدث الآن في المسرح";
  const h=$("tt"); h.className=e.t.length>85?"s":e.t.length>40?"m":"";
  h.innerHTML=e.t.split(" ").map((w,i)=>`<span style="animation-delay:${i*.08}s">${w}</span>`).join("");
  const d=e.t.split(" ").length*.08+.3;
  $("ls").innerHTML=e.l.map((x,i)=>`<li style="animation-delay:${d+i*.25}s">${x}</li>`).join("");
  $("tm").textContent=e.a+" – "+e.b;
}
let back=0;
function tick(){
  const n=nowM(), c=ev.find(e=>n>=e.s&&n<e.e), nx=ev.find(e=>e.s>n);
  const ph=((n%86400)%CYCLE);
  if(!c){ if(nx&&nx.s-n<5400){
    const q=(n%86400)%PRE_CYCLE,k=Math.floor(n/PRE_CYCLE);
    if(q<PRE_STEP) show("ev","pn"+nx.s+"_"+k,()=>fill(nx,true));
    else if(q<PRE_STEP*(LOGOS.length+1)) show("lg","pl"+k,()=>{lgd(PRE_STEP);setFly()});
    else show("cp","pc"+k,()=>setCp(true));
  } else show("cp","cp",()=>setCp(true));
  return;}
  const k=Math.floor(n/CYCLE),slot=Math.floor((n%86400)/CYCLE)%3,t=ph-SLOT_AT;
  if(t>=0){
    if(slot===0&&t<LOGO_EACH*LOGOS.length){back=k;return show("lg","lg"+k,()=>{lgd(LOGO_EACH);setFly()});}
    if(slot===1&&t<CAMPUS_LEN){back=k;return show("cp","cp"+k,()=>setCp(false));}
    if(slot===2&&t<NEXT_LEN&&nx&&c.e-n>NEXT_LEN){back=k;return show("ev","nx"+nx.s+"_"+k,()=>fill(nx,true));}
  }
  show("ev","c"+c.s+"_"+back,()=>fill(c,false));
  if(!$("ev").classList.contains("next"))$("pg").style.width=((n-c.s)/(c.e-c.s)*100)+"%";
}
addEventListener("resize",setFly);
if(new URLSearchParams(location.search).has("demo")||location.hash==="#demo"){
 $("lg").style.setProperty("--d","3s");const cap=document.createElement("div");cap.style.cssText="position:fixed;left:4vmin;bottom:3vmin;z-index:9;font-size:2.6vmin;color:#fff;background:#000a;padding:.8vmin 2vmin;border-radius:2vmin";document.body.appendChild(cap);
 const S=[[10,"1/6 الحدث الحالي",k=>show("ev",k,()=>{fill(ev[2],false);$("pg").style.width="45%"})],[15,"2/6 الشعارات الكبيرة (ينزل المبنى)",k=>show("lg",k,setFly)],[8,"3/6 شاشة الجامعة",k=>show("cp",k,()=>setCp(false))],[10,"4/6 الحدث القادم",k=>show("ev",k,()=>fill(ev[3],true))],[8,"5/6 وقت راحة",k=>show("ev",k,()=>{fill(ev[5],false);$("pg").style.width="60%"})],[15,"6/6 ما قبل البدء (تبديل الشعارات)",k=>show("cp",k,()=>setCp(true))]];
 let i=0,r=0;(function go(){const s=S[i%S.length];cap.textContent="تجربة "+s[1];s[2]("demo"+(r++));setTimeout(go,s[0]*1000);i++})();
}else{setInterval(tick,500);tick();}
