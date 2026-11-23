var K="lp-v1",GOAL=15,IDX=[],BK={},cur=null,reading=false,ST=load();
var DGS=[],DGI=[];
var MSG=["Mais um trecho lido. Pequenos passos fazem grandes leituras.","Muito bem. A constância vale mais do que a pressa.","Trecho concluído. O hábito de ler está a crescer.","Bom trabalho. Amanhã continua de onde paraste.","Mais um passo dado. Cada trecho conta."];
function load(){try{return JSON.parse(localStorage.getItem(K))||{done:{},ans:{},time:{}}}catch(e){return {done:{},ans:{},time:{}}}}
function save(){try{localStorage.setItem(K,JSON.stringify(ST))}catch(e){}}
function $(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function day(o){var d=new Date(Date.now()-(o||0)*864e5);return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function streak(){var n=0,i=(ST.time[day(0)]||0)>=60?0:1;while((ST.time[day(i)]||0)>=60){n++;i++}return n}
function bar(d,n){return "<span class=\"bar\"><i style=\"width:"+(n?Math.round(d*100/n):0)+"%\"></i></span>"}
function cnt(b){return BK[b].lessons.filter(function(L){return ST.done[b+"/"+L.id]}).length}
function nextIdx(b){var Ls=BK[b].lessons;for(var i=0;i<Ls.length;i++){if(!ST.done[b+"/"+Ls[i].id])return i}return 0}
function stats(){
  var m=Math.floor((ST.time[day(0)]||0)/60),p=Math.min(100,Math.round(m*100/GOAL));
  $("st").innerHTML="Hoje: "+m+" de "+GOAL+" min de leitura"+bar(p,100)+"Sequência: "+streak()+" dia(s) seguido(s)";
}
/* ---- Tabuleiros de xadrez (posições em FEN; sem motor, só desenho) ---- */
var PG={k:"\u265A",q:"\u265B",r:"\u265C",b:"\u265D",n:"\u265E",p:"\u265F"},KD={capablanca:"Exemplo do livro",historica:"Partida histórica",didactica:"Exemplo didáctico"},PTL={K:"R",Q:"D",R:"T",B:"B",N:"C"};
function pt(m){return String(m).replace(/^[KQRBN]/,function(x){return PTL[x]}).replace(/=([QRBN])/,function(a,x){return "="+PTL[x]})}
function grid(f){
  try{
    var rows=String(f).split(" ")[0].split("/"),g=[];
    if(rows.length!==8)return null;
    for(var i=0;i<8;i++){
      var r=[];
      for(var j=0;j<rows[i].length;j++){
        var c=rows[i].charAt(j);
        if(c>="1"&&c<="8"){for(var n=0;n<+c;n++)r.push("")}else if(PG[c.toLowerCase()])r.push(c);else return null;
      }
      if(r.length!==8)return null;
      g.push(r);
    }
    return g;
  }catch(e){return null}
}
function sq(a){return a&&a.length===2?(a.charCodeAt(0)-97)+","+(8-(+a.charAt(1))):""}
function boardHTML(d,s){
  var f=s<0?d.start:d.steps[s].fen,g=grid(f);
  if(!g)return "";
  var fl=d.orientation==="b",a=s>=0?sq(d.steps[s].from):"",b=s>=0?sq(d.steps[s].to):"",h="";
  for(var y=0;y<8;y++)for(var x=0;x<8;x++){
    var R=fl?7-y:y,C=fl?7-x:x,p=g[R][C],k=C+","+R;
    var cl="sq "+((R+C)%2?"dk":"lt")+(k===a?" hf":"")+(k===b?" ht":"");
    h+="<div class=\""+cl+"\">"+(p?"<span class=\"pc "+(p===p.toUpperCase()?"pw":"pb")+"\">"+PG[p.toLowerCase()]+"\uFE0E</span>":"");
    if(x===0)h+="<i class=\"rk\">"+(8-R)+"</i>";
    if(y===7)h+="<i class=\"fl\">"+String.fromCharCode(97+C)+"</i>";
    h+="</div>";
  }
  return h;
}
function dgLabel(d,s){return d.title+(s<0?". Posição inicial.":". Depois de "+pt(d.steps[s].san)+".")}
function dgHTML(k){
  var d=DGS[k];
  if(!d||!d.start||!grid(d.start))return "";
  var st=d.steps||[],h="<figure class=\"dg\" id=\"dg"+k+"\"><p class=\"dt\"><b>"+esc(d.title||"")+"</b> <span class=\"kd\">"+esc(KD[d.kind]||"")+"</span></p>";
  if(d.description)h+="<p class=\"mu\">"+esc(d.description)+"</p>";
  h+="<div class=\"bd\" id=\"bd"+k+"\" role=\"img\" aria-label=\""+esc(dgLabel(d,-1))+"\">"+boardHTML(d,-1)+"</div>";
  if(st.length){
    h+="<div class=\"ct\"><button class=\"sec\" data-a=\"dgp\" data-d=\""+k+"\">Lance anterior</button><button class=\"sec\" data-a=\"dgn\" data-d=\""+k+"\">Lance seguinte</button><button class=\"sec\" data-a=\"dgr\" data-d=\""+k+"\">Reiniciar posição</button></div>";
    h+="<p class=\"dn\" id=\"dn"+k+"\" aria-live=\"polite\">Posição inicial. Usa os botões, ou as setas do teclado, para avançar lance a lance.</p><div class=\"mv\" id=\"mv"+k+"\">";
    var n=+String(d.start).split(" ")[5]||1,c=String(d.start).split(" ")[1]==="b"?"b":"w";
    st.forEach(function(x,i){
      if(c==="w")h+="<span class=\"mn\">"+n+".</span>";else if(i===0)h+="<span class=\"mn\">"+n+"...</span>";
      h+="<button class=\"mb\" data-a=\"dgs\" data-d=\""+k+"\" data-s=\""+i+"\">"+esc(pt(x.san))+"</button>";
      if(c==="b")n++;
      c=c==="w"?"b":"w";
    });
    h+="</div><p class=\"mu\">Notação portuguesa: R Rei, D Dama, T Torre, B Bispo, C Cavalo; sem letra, é um peão.</p>";
  }
  if(d.source)h+="<p class=\"mu\">"+esc(d.source)+"</p>";
  return h+"</figure>";
}
function dgGo(k,s){
  var d=DGS[k];
  if(!d||!d.steps||s<-1||s>=d.steps.length)return;
  if(s>DGI[k]&&s>=0)snd(sanSnd(d.steps[s].san));
  DGI[k]=s;
  $("bd"+k).innerHTML=boardHTML(d,s);
  $("bd"+k).setAttribute("aria-label",dgLabel(d,s));
  $("dn"+k).textContent=s<0?"Posição inicial.":pt(d.steps[s].san)+(d.steps[s].note?": "+d.steps[s].note:"");
  var bs=$("mv"+k).querySelectorAll(".mb");
  for(var i=0;i<bs.length;i++)bs[i].className=i===s?"mb on":"mb";
  var cs=$("dg"+k).querySelectorAll(".ct button");
  cs[0].className=s<0?"sec off":"sec";cs[1].className=s>=d.steps.length-1?"sec off":"sec";cs[2].className=s<0?"sec off":"sec";
  cs[0].setAttribute("aria-disabled",s<0);cs[1].setAttribute("aria-disabled",s>=d.steps.length-1);cs[2].setAttribute("aria-disabled",s<0);
}
function home(){
  reading=false;setHash("");
  var h="";
  if(PZ().length){var t=ST.dz&&ST.dz[day(0)];h+="<div class=\"card dz\"><h3>♟️ Desafio de xadrez do dia #"+pzNum()+"</h3><p class=\"mu\">"+(t&&t.f?(t.ok?"Resolvido hoje. Volta amanhã para um novo desafio!":"Hoje escapou. Amanhã há outro!"):"Uma posição das partidas de Capablanca. Encontras o melhor lance?")+(dzStreak()?" 🔥 "+dzStreak()+" dia(s) seguido(s).":"")+"</p><button data-a=\"pz\">"+(t&&t.f?"Ver o desafio":"Resolver o desafio")+"</button></div>";}
  h+="<h2>Os teus livros</h2>";
  IDX.forEach(function(x){
    var B=BK[x.id],n=B.lessons.length,d=cnt(x.id);
    h+="<div class=\"card\"><h3>"+esc(B.title)+"</h3><p class=\"mu\">"+esc(B.author)+"</p>"+bar(d,n)+"<p class=\"mu\">"+d+" de "+n+" trechos lidos</p><button data-a=\"next\" data-b=\""+x.id+"\">"+(d?"Continuar":"Começar")+"</button><button class=\"sec\" data-a=\"list\" data-b=\""+x.id+"\">Ver trechos</button></div>";
  });
  $("v").innerHTML=h;
}
function list(b){
  reading=false;
  var B=BK[b],h="<button class=\"sec\" data-a=\"home\">← Início</button><h2>"+esc(B.title)+"</h2>";
  B.lessons.forEach(function(L,i){
    h+="<button class=\"sec\" data-a=\"open\" data-b=\""+b+"\" data-i=\""+i+"\">"+(ST.done[b+"/"+L.id]?"✓ ":"")+esc(L.id)+": "+esc(L.title)+"</button><br>";
  });
  $("v").innerHTML=h;
}
function open(b,i){
  var B=BK[b],L=B.lessons[i];
  cur={b:b,i:i};reading=true;
  setHash(b+"-"+L.id);
  var h="<button class=\"sec\" data-a=\"list\" data-b=\""+b+"\">← Trechos</button><h2>"+esc(B.title)+"</h2><p class=\"mu\">"+esc(L.id)+": "+esc(L.title)+"</p>";
  h+=shareHTML("📖 "+B.title+" — "+L.title+"\nLê este trecho no Leitura Paulatina:",SITE+"#"+b+"-"+L.id,"Partilhar este trecho");
  DGS=L.diagrams||[];DGI=DGS.map(function(){return -1});
  var ln=L.text.length;
  h+="<div class=\"tx\">"+L.text.map(function(p,j){
    var x="<p dir=\"auto\">"+esc(p)+"</p>";
    DGS.forEach(function(d,k){var a=d.after==null?ln-1:Math.max(0,Math.min(ln-1,+d.after));if(a===j)x+=dgHTML(k)});
    return x;
  }).join("")+"</div>";
  h+="<details><summary>Glossário</summary>"+L.glossary.map(function(g){return "<p><b>"+esc(g.t)+":</b> "+esc(g.d)+"</p>"}).join("")+"</details>";
  h+="<h3>Perguntas</h3>"+L.questions.map(function(q,n){
    return "<div class=\"q\" id=\"q"+n+"\"><p><b>"+(n+1)+". "+esc(q.q)+"</b></p>"+q.options.map(function(o,k){
      return "<button class=\"opt\" data-a=\"opt\" data-q=\""+n+"\" data-o=\""+k+"\">"+"abcd".charAt(k)+") "+esc(o)+"</button>";
    }).join("")+"<p class=\"why\"></p></div>";
  }).join("");
  h+="<p id=\"sc\" class=\"mu\"></p><h3>Resumo</h3><p>"+esc(L.summary)+"</p><div id=\"fin\"><button data-a=\"done\">Concluir trecho</button></div>";
  $("v").innerHTML=h;window.scrollTo(0,0);
  L.questions.forEach(function(q,n){var a=ST.ans[b+"/"+L.id+":"+n];if(a!==undefined)paint(n,a)});
  score();
  if(ST.done[b+"/"+L.id])fin();
}
function paint(n,o){
  var q=BK[cur.b].lessons[cur.i].questions[n],d=$("q"+n),bs=d.querySelectorAll(".opt");
  for(var k=0;k<bs.length;k++){
    bs[k].disabled=true;
    if(k===q.answer)bs[k].className="opt ok";
    else if(k===o)bs[k].className="opt no";
  }
  d.querySelector(".why").textContent=(o===q.answer?"Correcto. ":"Resposta certa: "+"abcd".charAt(q.answer)+". ")+q.why;
}
function score(){
  var L=BK[cur.b].lessons[cur.i],c=0,r=0;
  L.questions.forEach(function(q,n){var a=ST.ans[cur.b+"/"+L.id+":"+n];if(a!==undefined){r++;if(a===q.answer)c++}});
  $("sc").textContent=r?"Acertos: "+c+" de "+r+" respondidas":"";
}
function fin(){
  var b=cur.b,B=BK[b],L=B.lessons[cur.i];
  ST.done[b+"/"+L.id]=1;save();stats();
  var nx=cur.i+1<B.lessons.length;
  $("fin").innerHTML="<p class=\"msg\">"+MSG[cnt(b)%MSG.length]+"</p>"+(nx?"<button data-a=\"open\" data-b=\""+b+"\" data-i=\""+(cur.i+1)+"\">Próximo trecho</button>":"")+"<button class=\"sec\" data-a=\"home\">Início</button>";
}
$("v").onclick=function(e){
  var t=e.target.closest?e.target.closest("[data-a]"):e.target;
  if(!t||!t.dataset||!t.dataset.a)return;
  var a=t.dataset.a;
  if(a==="home")home();
  else if(a==="list")list(t.dataset.b);
  else if(a==="next")open(t.dataset.b,nextIdx(t.dataset.b));
  else if(a==="open")open(t.dataset.b,+t.dataset.i);
  else if(a==="done")fin();
  else if(a==="dgp")dgGo(+t.dataset.d,DGI[+t.dataset.d]-1);
  else if(a==="dgn")dgGo(+t.dataset.d,DGI[+t.dataset.d]+1);
  else if(a==="dgr")dgGo(+t.dataset.d,-1);
  else if(a==="dgs")dgGo(+t.dataset.d,+t.dataset.s);
  else if(a==="pz")puzzle();
  else if(a==="pzh")pzHint();
  else if(a==="snd"){ST.mute=!ST.mute;save();t.textContent=ST.mute?"🔇 Som":"🔊 Som";if(!ST.mute)snd("move")}
  else if(a==="cp")copyTxt(t);
  else if(a==="opt"){
    var n=+t.dataset.q,o=+t.dataset.o;
    ST.ans[cur.b+"/"+BK[cur.b].lessons[cur.i].id+":"+n]=o;save();paint(n,o);score();
  }
};
$("v").onkeydown=function(e){
  if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
  var f=e.target.closest?e.target.closest(".dg"):null;
  if(!f)return;
  var k=+f.id.slice(2);
  e.preventDefault();
  dgGo(k,DGI[k]+(e.key==="ArrowRight"?1:-1));
};
setInterval(function(){
  if(reading&&!document.hidden){ST.time[day(0)]=(ST.time[day(0)]||0)+10;save();stats()}
},10000);
stats();
fetch("lessons/index.json").then(function(r){return r.json()}).then(function(ix){
  IDX=ix;
  return Promise.all(ix.map(function(x){
    return fetch("lessons/"+x.file).then(function(r){return r.json()}).then(function(j){BK[x.id]=j}).catch(function(){});
  }));
}).then(function(){IDX=IDX.filter(function(x){return BK[x.id]});if(!IDX.length)throw 0;route()}).catch(function(){$("v").innerHTML="<p>Não foi possível carregar os livros.</p>"});

/* ---- Partilha, links por trecho e desafio de xadrez do dia ---- */
var SITE="https://brevemito.github.io/leitura-paulatina/",CB="chess-fundamentals",PZL=null,PZS={sel:"",lock:false};
function setHash(h){try{history.replaceState(null,"",location.pathname+location.search+(h?"#"+h:""))}catch(e){}}
function route(){
  var h=decodeURIComponent(location.hash.slice(1)),m=h.match(/^(.+)-(\d{3})$/);
  if(h==="desafio"&&PZ().length)return puzzle();
  if(m&&BK[m[1]]){var i=BK[m[1]].lessons.findIndex(function(L){return L.id===m[2]});if(i>=0)return open(m[1],i)}
  home();
}
window.addEventListener("hashchange",route);
function shareHTML(txt,url,lab){
  var full=txt+"\n"+url;
  return "<p class=\"sh\"><a class=\"wa\" href=\"https://wa.me/?text="+encodeURIComponent(full)+"\" target=\"_blank\" rel=\"noopener\">"+lab+" no WhatsApp</a><a class=\"fb\" href=\"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url)+"\" target=\"_blank\" rel=\"noopener\">Facebook</a><button class=\"sec\" data-a=\"cp\" data-t=\""+esc(full).replace(/"/g,"&quot;")+"\">Copiar texto</button></p>";
}
function copyTxt(b){
  var t=b.dataset.t,ok=function(){b.textContent="Copiado ✓"};
  try{navigator.clipboard.writeText(t).then(ok,function(){prompt("Copia o texto:",t)})}catch(e){prompt("Copia o texto:",t)}
}
function PZ(){
  if(PZL)return PZL;PZL=[];
  var B=BK[CB];if(!B)return PZL;
  B.lessons.forEach(function(L,li){(L.diagrams||[]).forEach(function(d){var st=d.steps||[];
    st.forEach(function(x,i){if(x.note&&x.note.indexOf("🧩")>=0&&st[i+1])PZL.push({li:li,L:L,d:d,i:i,q:x.note.split("🧩 Desafio:")[1]||"Encontra o melhor lance.",a:st[i+1]})})})});
  var n=PZL.length,o=[];
  if(n%7)for(var k=0;k<n;k++)o.push(PZL[(k*7)%n]);else o=PZL;
  return PZL=o;
}
function dayNo(){var d=new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(2026,10,23))/864e5)}
function pzNum(){return dayNo()+1}
function pzToday(){var p=PZ();return p[((dayNo()%p.length)+p.length)%p.length]}
function dzStreak(){var n=0,i=0;ST.dz=ST.dz||{};if(!(ST.dz[day(0)]&&ST.dz[day(0)].ok))i=1;while(ST.dz[day(i)]&&ST.dz[day(i)].ok){n++;i++}return n}

/* ---- Som das peças (sintetizado no navegador, sem ficheiros) ---- */
var AC=null;
function sanSnd(san){return /#|\+/.test(san)?"check":(/x/.test(san)?"cap":(/O-O/.test(san)?"castle":"move"))}
function snd(type){
  if(ST.mute)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended")AC.resume();
    var t0=AC.currentTime;
    function knock(at,freq,vol,len){
      var n=Math.floor(AC.sampleRate*len),buf=AC.createBuffer(1,n,AC.sampleRate),ch=buf.getChannelData(0);
      for(var i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,4);
      var src=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();
      src.buffer=buf;bp.type="bandpass";bp.frequency.value=freq;bp.Q.value=1.2;g.gain.value=vol;
      src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start(t0+at);
    }
    function tone(at,f,len,vol,type){
      var o=AC.createOscillator(),g=AC.createGain();o.type=type||"sine";o.frequency.value=f;
      g.gain.setValueAtTime(vol,t0+at);g.gain.exponentialRampToValueAtTime(0.001,t0+at+len);
      o.connect(g);g.connect(AC.destination);o.start(t0+at);o.stop(t0+at+len);
    }
    if(type==="move")knock(0,1400,1.6,.07);
    else if(type==="cap"){knock(0,1100,2.2,.08);knock(.06,1700,1.4,.06)}
    else if(type==="castle"){knock(0,1400,1.4,.06);knock(.1,1300,1.4,.06)}
    else if(type==="check"){knock(0,1500,1.8,.07);tone(.02,880,.18,.12,"triangle")}
    else if(type==="wrong"){tone(0,220,.22,.18,"square");tone(.12,165,.28,.15,"square")}
    else if(type==="right"){tone(0,660,.15,.18);tone(.12,880,.15,.18);tone(.24,1320,.3,.16)}
  }catch(e){}
}

/* ---- Desafio do dia: jogabilidade ao estilo dos problemas de táctica ---- */
var PZG=null;
function pzFen(p){return p.d.steps[p.i].fen}
function pzRender(fen,o){
  o=o||{};var g=grid(fen),wb=PZS.wb,h="";
  for(var y=0;y<8;y++)for(var x=0;x<8;x++){
    var R=wb?y:7-y,C=wb?x:7-x,pc=g[R][C],s=String.fromCharCode(97+C)+(8-R);
    var cl="sq "+((R+C)%2?"dk":"lt")+(s===PZS.sel?" sel":"")+(o.last&&(s===o.last.from||s===o.last.to)?" hl":"")+(o.hint===s?" hint":"");
    if(PZS.tg[s])cl+=pc?" cap":" dot";
    h+="<div class=\""+cl+"\" data-s=\""+s+"\">"+(pc?"<span class=\"pc "+(pc===pc.toUpperCase()?"pw":"pb")+"\">"+PG[pc.toLowerCase()]+"\uFE0E</span>":"");
    if(o.mark&&o.mark.s===s)h+="<b class=\"mk "+(o.mark.ok?"mk-ok":"mk-no")+"\">"+(o.mark.ok?"✓":"✗")+"</b>";
    if(x===0)h+="<i class=\"rk\">"+(8-R)+"</i>";
    if(y===7)h+="<i class=\"fl\">"+String.fromCharCode(97+C)+"</i>";
    h+="</div>";
  }
  $("pzb").innerHTML=h;
}
function pzAnim(from,to){
  var a=$("pzb").querySelector("[data-s=\""+from+"\"]"),b=$("pzb").querySelector("[data-s=\""+to+"\"]");
  if(!a||!b)return;var pc=b.querySelector(".pc");if(!pc)return;
  var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
  pc.style.transition="none";pc.style.transform="translate("+(ra.left-rb.left)+"px,"+(ra.top-rb.top)+"px)";
  pc.getBoundingClientRect();pc.style.transition="transform .18s ease-out";pc.style.transform="";
}
function pzTargets(s){
  PZS.tg={};if(!PZG||!s)return;
  PZG.moves({square:s,verbose:true}).forEach(function(m){PZS.tg[m.to]=1});
}
function pzMine(s){var g=grid(pzFen(pzToday())),pc=g[8-(+s.charAt(1))][s.charCodeAt(0)-97];return pc&&((pc===pc.toUpperCase())===PZS.wb)}
function puzzle(){
  reading=false;setHash("desafio");
  var p=pzToday(),f=pzFen(p),wb=f.split(" ")[1]==="w";
  PZS={sel:"",lock:false,wb:wb,tg:{}};PZG=window.Chess?new Chess(f):null;
  ST.dz=ST.dz||{};var t=ST.dz[day(0)]||{n:0,r:"",f:0,ok:0};ST.dz[day(0)]=t;
  var h="<button class=\"sec\" data-a=\"home\">← Início</button><h2>♟️ Desafio de xadrez do dia #"+pzNum()+"</h2>";
  h+="<p class=\"mu\">"+esc(p.d.title)+"</p><p class=\"turn\"><i class=\"tc "+(wb?"tw":"tb")+"\"></i><b>Jogam as "+(wb?"Brancas":"Pretas")+".</b> "+esc(p.q.trim())+"</p>";
  h+="<div class=\"bd pz\" id=\"pzb\"></div><p id=\"pzm\" class=\"dn\" aria-live=\"polite\"></p>";
  h+="<div class=\"ct\" id=\"pzc\"><button class=\"sec\" data-a=\"pzh\">💡 Dica</button><button class=\"sec\" data-a=\"snd\">"+(ST.mute?"🔇 Som":"🔊 Som")+"</button></div><div id=\"pzr\"></div>";
  $("v").innerHTML=h;window.scrollTo(0,0);
  pzRender(f);pzBind();
  if(t.f)pzEnd(true);else $("pzm").textContent=t.n?"Tentativas usadas: "+t.n+" de 3.":"Arrasta a peça, ou toca nela e depois na casa. Tens 3 tentativas.";
}
function pzBind(){
  var b=$("pzb"),drag=null;
  function sqAt(x,y){var e=document.elementFromPoint(x,y);e=e&&e.closest?e.closest("#pzb [data-s]"):null;return e?e.dataset.s:""}
  b.onpointerdown=function(e){
    var t=ST.dz[day(0)];if(t.f||PZS.lock)return;
    var el=e.target.closest("[data-s]");if(!el)return;var s=el.dataset.s;
    if(PZS.sel&&PZS.sel!==s&&!pzMine(s)){pzTry(PZS.sel,s);return}
    if(!pzMine(s)){PZS.sel="";PZS.tg={};pzRender(pzFen(pzToday()));return}
    e.preventDefault();
    var again=PZS.sel===s;PZS.sel=s;pzTargets(s);pzRender(pzFen(pzToday()));
    var pc=b.querySelector("[data-s=\""+s+"\"] .pc");if(!pc)return;
    var r=pc.getBoundingClientRect(),gh=pc.cloneNode(true);
    gh.className+=" ghost";gh.style.left=(e.clientX-r.width/2)+"px";gh.style.top=(e.clientY-r.height/2)+"px";gh.style.width=r.width+"px";
    document.body.appendChild(gh);pc.style.opacity=".35";
    drag={s:s,gh:gh,w:r.width,h:r.height,moved:false,again:again};
    try{b.setPointerCapture(e.pointerId)}catch(x){}
  };
  b.onpointermove=function(e){if(!drag)return;drag.moved=true;drag.gh.style.left=(e.clientX-drag.w/2)+"px";drag.gh.style.top=(e.clientY-drag.h/2)+"px"};
  b.onpointerup=function(e){
    if(!drag)return;var d=drag;drag=null;d.gh.remove();
    var to=sqAt(e.clientX,e.clientY);
    if(to&&to!==d.s){pzTry(d.s,to);return}
    if(d.again&&!d.moved){PZS.sel="";PZS.tg={}}
    pzRender(pzFen(pzToday()));
  };
  b.onpointercancel=function(){if(drag){drag.gh.remove();drag=null;pzRender(pzFen(pzToday()))}};
}
function pzTry(from,to){
  var t=ST.dz[day(0)],p=pzToday(),f=pzFen(p),mv=null;
  if(PZG){PZG.load(f);mv=PZG.move({from:from,to:to,promotion:"q"});
    if(!mv){PZS.sel="";PZS.tg={};pzRender(f);return}}
  PZS.sel="";PZS.tg={};PZS.lock=true;
  var ok=from===p.a.from&&to===p.a.to,after=ok?p.a.fen:(PZG?PZG.fen():f);
  pzRender(after,{last:{from:from,to:to},mark:{s:to,ok:ok}});pzAnim(from,to);
  snd(mv?sanSnd(mv.san):"move");
  t.n++;t.r+=ok?"✅":"❌";
  if(ok){t.ok=1;t.f=1;save();setTimeout(function(){snd("right")},220);setTimeout(function(){pzReply()},900);return}
  if(t.n>=3)t.f=1;save();
  setTimeout(function(){snd("wrong");$("pzm").textContent=t.f?"Não era esse.":"Não é esse. Tenta outra vez ("+t.n+" de 3).";},250);
  setTimeout(function(){
    pzRender(f,{last:{from:to,to:from}});pzAnim(to,from);PZS.lock=false;
    if(t.f)setTimeout(function(){pzEnd()},500);
  },1100);
}
function pzReply(){
  var p=pzToday(),r=p.d.steps[p.i+2];
  if(r){pzRender(r.fen,{last:{from:r.from,to:r.to}});pzAnim(r.from,r.to);snd(sanSnd(r.san))}
  setTimeout(function(){pzEnd()},r?500:0);
}
function pzHint(){
  var t=ST.dz[day(0)],p=pzToday();if(t.f||PZS.lock)return;
  t.h=1;save();pzRender(pzFen(p),{hint:p.a.from});$("pzm").textContent="Dica: a peça a mexer está assinalada.";
}
function pzEnd(again){
  var t=ST.dz[day(0)],p=pzToday(),a=p.a,stk=dzStreak();PZS.lock=true;
  var r=p.d.steps[p.i+2];
  if(again||!t.ok){var fe=a.fen,la={from:a.from,to:a.to};if(t.ok&&r){fe=r.fen;la={from:r.from,to:r.to}}pzRender(fe,{last:la,mark:{s:a.to,ok:true}});if(!again)pzAnim(a.from,a.to)}
  if(!t.ok&&!again)snd(sanSnd(a.san));
  $("pzm").textContent=(t.ok?"Correcto! ":"Desta vez escapou. ")+"O lance era "+pt(a.san)+(a.note?": "+a.note.split("🧩")[0].trim():".")+(t.ok&&r?" Resposta das "+(PZS.wb?"Pretas":"Brancas")+": "+pt(r.san)+".":"");
  var c=$("pzc");if(c)c.innerHTML="<button class=\"sec\" data-a=\"snd\">"+(ST.mute?"🔇 Som":"🔊 Som")+"</button>";
  var res=t.ok?"Acertei à "+t.n+".ª tentativa"+(t.h?" (com dica)":""):"Desta vez escapou-me";
  var txt="♟️ Desafio de xadrez #"+pzNum()+" — Leitura Paulatina\n"+t.r+(t.h?"💡":"")+" "+res+(stk>1?"\n🔥 "+stk+" dias seguidos":"")+"\nConsegues?";
  $("pzr").innerHTML="<div class=\"card\"><p><b>"+t.r+(t.h?"💡":"")+" "+res+"</b>"+(stk?" · 🔥 "+stk+" dia(s) seguido(s)":"")+"</p>"+shareHTML(txt,SITE+"#desafio","Partilhar o resultado")+"<button data-a=\"open\" data-b=\""+CB+"\" data-i=\""+p.li+"\">Ver a partida completa</button><p class=\"mu\">Novo desafio amanhã.</p></div>";
}
