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
  reading=false;
  var h="<h2>Os teus livros</h2>";
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
  var h="<button class=\"sec\" data-a=\"list\" data-b=\""+b+"\">← Trechos</button><h2>"+esc(B.title)+"</h2><p class=\"mu\">"+esc(L.id)+": "+esc(L.title)+"</p>";
  DGS=L.diagrams||[];DGI=DGS.map(function(){return -1});
  var ln=L.text.length;
  h+="<div class=\"tx\">"+L.text.map(function(p,j){
    var x="<p>"+esc(p)+"</p>";
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
  var t=e.target,a=t.dataset.a;
  if(!a)return;
  if(a==="home")home();
  else if(a==="list")list(t.dataset.b);
  else if(a==="next")open(t.dataset.b,nextIdx(t.dataset.b));
  else if(a==="open")open(t.dataset.b,+t.dataset.i);
  else if(a==="done")fin();
  else if(a==="dgp")dgGo(+t.dataset.d,DGI[+t.dataset.d]-1);
  else if(a==="dgn")dgGo(+t.dataset.d,DGI[+t.dataset.d]+1);
  else if(a==="dgr")dgGo(+t.dataset.d,-1);
  else if(a==="dgs")dgGo(+t.dataset.d,+t.dataset.s);
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
}).then(function(){IDX=IDX.filter(function(x){return BK[x.id]});if(!IDX.length)throw 0;home()}).catch(function(){$("v").innerHTML="<p>Não foi possível carregar os livros.</p>"});
