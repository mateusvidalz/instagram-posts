// Exporta os slides .dc.html de um canvas Design para JPG 1080x1350.
// uso: node exportar.js <pasta project do canvas> <pasta de saida> <mapa.json> <AAAA-MM-DD ter> <AAAA-MM-DD qui> <AAAA-MM-DD dom>
// mapa.json: {"<id do blob>": "/caminho/local/da/gravura.png", ...}
// Nomes dos arquivos: Main.dc.html = terca slide 1; Ter-02..; Qui-01..; Dom-01..
// Saida: <data>_<NN>.jpg (ex.: 2026-11-10_01.jpg)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [dir,out,mapa,ter,qui,dom]=process.argv.slice(2);const map=JSON.parse(fs.readFileSync(mapa,'utf8'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.dc.html'))){let day,n;if(f==='Main.dc.html'){day='Ter';n=1}else{[day,n]=f.replace('.dc.html','').split('-');n=+n}
const data={Ter:ter,Qui:qui,Dom:dom}[day];if(!data)continue;
let h=fs.readFileSync(path.join(dir,f),'utf8').replace(/<script src="\.\/support\.js"><\/script>/,'').replace(/<\/?x-dc>/g,'').replace(/<\/?helmet>/g,'').replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/,'');
for(const k in map)h=h.split('/_blob/'+k).join('file://'+map[k]);
const tmp=path.join(out,'_tmp.html');fs.writeFileSync(tmp,h);await p.goto('file://'+tmp,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
const png=path.join(out,data+'_'+String(n).padStart(2,'0')+'.png');await p.screenshot({path:png,clip:{x:0,y:0,width:1080,height:1350}});console.log(png);}
fs.unlinkSync(path.join(out,'_tmp.html'));await b.close();})();
// depois: converta cada PNG para JPG (qualidade 92) e apague os PNG.
