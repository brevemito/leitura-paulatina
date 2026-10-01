var K="lp-v1",GOAL=15,IDX=[],BK={},cur=null,reading=false,ST=load();
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
  h+="<div class=\"tx\">"+L.text.map(function(p){return "<p>"+esc(p)+"</p>"}).join("")+"</div>";
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
  else if(a==="opt"){
    var n=+t.dataset.q,o=+t.dataset.o;
    ST.ans[cur.b+"/"+BK[cur.b].lessons[cur.i].id+":"+n]=o;save();paint(n,o);score();
  }
};
setInterval(function(){
  if(reading&&!document.hidden){ST.time[day(0)]=(ST.time[day(0)]||0)+10;save();stats()}
},10000);
stats();
fetch("lessons/index.json").then(function(r){return r.json()}).then(function(ix){
  IDX=ix;
  return Promise.all(ix.map(function(x){
    return fetch("lessons/"+x.file).then(function(r){return r.json()}).then(function(j){BK[x.id]=j});
  }));
}).then(home).catch(function(){$("v").innerHTML="<p>Não foi possível carregar os livros.</p>"});
