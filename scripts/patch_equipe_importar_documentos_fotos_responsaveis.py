#!/usr/bin/env python3
"""Importação em equipe: docs p15, fotos, rótulos e acréscimo de responsáveis.
Não altera guia individual nem a avaliação APPCC.
"""
from pathlib import Path
import re,subprocess,json

p=Path('equipe.html')
s=p.read_text(encoding='utf-8')

def one(old,new):
 global s
 assert s.count(old)==1,(old[:160],s.count(old))
 s=s.replace(old,new,1)

helper=r"""
const TEAM18_DOC_FIELDS=[...new Set(D.widgets.filter(w=>w.page===14&&/^doc_legal_\d+_(situacao|atende|observacao)$/.test(w.name)).map(w=>w.name))];
const TEAM18_PHOTO_SLOTS=[...new Set(D.widgets.filter(w=>[15,16].includes(w.page)&&/^(Imagem[1-6]|Foto_Extra_[1-6])$/.test(w.name)).map(w=>w.name))];
const TEAM18_LABEL_SLOTS=[...new Set(D.widgets.filter(w=>[19,20,21].includes(w.page)&&/^(Imagem[1-3]_af_image|Rotulo_Pagina_[23]_[1-3])$/.test(w.name)).map(w=>w.name))];
const TEAM18_RESP_FIELD='RESPONSÁVEIS PELA INSPEÇÃORow1';
const TEAM18_EXTRAS={
 documents:{label:'Documentos legais e regulatórios — página 15'},
 photos:{label:'Fotos anexadas — páginas 16 e 17'},
 labels:{label:'Rótulos anexados — páginas 20 a 22'},
 inspectors:{label:'Responsáveis pela inspeção — acrescentar para conferência'}
};
function imageTeam18(value){
 return typeof value==='string'&&/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=\s]+$/.test(value);
}
function parsedTeamImages18(raw){
 const allowed=new Set([...TEAM18_PHOTO_SLOTS,...TEAM18_LABEL_SLOTS]),pics={};
 if(!raw||typeof raw!=='object')return pics;
 for(const [name,data]of Object.entries(raw))if(allowed.has(name)&&imageTeam18(data))pics[name]=data;
 return pics;
}
function countTeamExtra18(incoming,key){
 if(key==='documents')return TEAM18_DOC_FIELDS.filter(n=>nonempty18(incoming.values?.[n])).length;
 if(key==='inspectors')return String(incoming.values?.[TEAM18_RESP_FIELD]||'').trim()?1:0;
 const slots=key==='photos'?TEAM18_PHOTO_SLOTS:TEAM18_LABEL_SLOTS;
 return slots.filter(n=>imageTeam18(incoming.images?.[n])).length;
}
function teamPhotoMeta18(from,to){
 const possible=['BPF_PhotoProcess_','BPF_PhotoLocation_','BPF_PhotoRotation_','BPF_PhotoAngle_'];
 return possible.filter(prefix=>Object.hasOwn(D.fields,prefix+from)&&Object.hasOwn(D.fields,prefix+to))
                .map(prefix=>[prefix+from,prefix+to]);
}
function appendInspectors18(previous,received,file){
 const old=String(previous||'').trimEnd(),text=String(received||'').trim();
 if(!text)return {text:old,added:0};
 const existing=new Set(old.split(/\r?\n/).map(x=>x.trim().toLocaleLowerCase('pt-BR')).filter(Boolean));
 const seen=new Set(existing);
 const fresh=text.split(/\r?\n/).filter(line=>{
  const key=line.trim().toLocaleLowerCase('pt-BR');
  if(!key||seen.has(key))return false;
  seen.add(key);return true;
 });
 if(!fresh.length)return {text:old,added:0};
 // A conferência posterior é obrigatória antes da consolidação final do relatório.
 const origin=String(file||'arquivo da equipe').replace(/[\r\n]/g,' ').slice(0,110);
 const block='[IMPORTADO PARA CONFERÊNCIA — '+origin+']\n'+fresh.join('\n');
 return {text:old?(old+'\n\n'+block):block,added:fresh.length};
}
function mergeTeamExtras18(targetValues,targetImages,incoming,selected,filename){
 const stats={documents:0,documentsKept:0,photos:0,labels:0,duplicates:0,inspectors:0};
 // Use a temporary copy in applyTeam18; no partial changes if one category exceeds capacity.
 if(selected.includes('documents')){
  for(const name of TEAM18_DOC_FIELDS){
   const v=incoming.values[name];
   if(!nonempty18(v))continue;
   if(nonempty18(targetValues[name])){
    if(targetValues[name]!==v)stats.documentsKept++;
    continue;
   }
   targetValues[name]=v;stats.documents++;
  }
 }
 for(const [category,slots]of [['photos',TEAM18_PHOTO_SLOTS],['labels',TEAM18_LABEL_SLOTS]]){
  if(!selected.includes(category))continue;
  const incomingNames=slots.filter(name=>imageTeam18(incoming.images?.[name]));
  const pending=[];
  for(const src of incomingNames){
   if(slots.some(name=>targetImages[name]===incoming.images[src])){stats.duplicates++;continue;}
   pending.push(src);
  }
  const free=slots.filter(name=>!imageTeam18(targetImages[name]));
  if(pending.length>free.length)throw Error('Não há posições livres para '+pending.length+' '+TEAM18_EXTRAS[category].label+
   ' (disponíveis: '+free.length+'). Nenhuma foto ou rótulo existente foi sobrescrito. Libere posições e tente novamente.');
  for(const src of pending){
   let index=free.indexOf(src);
   if(index<0)index=0;
   const dest=free.splice(index,1)[0];
   targetImages[dest]=incoming.images[src];
   // Transferir a identificação da foto com ela (processo, local e rotação, quando houver).
   for(const [a,b]of teamPhotoMeta18(src,dest)){
    const val=incoming.values[a];
    if(typeof val==='string'&&!nonempty18(targetValues[b]))targetValues[b]=val;
   }
   stats[category]++;
  }
 }
 if(selected.includes('inspectors')){
  const out=appendInspectors18(targetValues[TEAM18_RESP_FIELD],incoming.values[TEAM18_RESP_FIELD],filename);
  targetValues[TEAM18_RESP_FIELD]=out.text;stats.inspectors=out.added;
 }
 return stats;
}
"""
one("const TEAM18={queue:[],preview:null,busy:false};",helper+"\nconst TEAM18={queue:[],preview:null,busy:false};")
one("processes:r.processes.filter(p=>Object.hasOwn(PROCESSES18,p))",
    "processes:r.processes.filter(p=>Object.hasOwn(PROCESSES18,p)||Object.hasOwn(TEAM18_EXTRAS,p))")
one("const incoming={values:parseValues18(raw.values),team18:raw.team18}",
    "const incoming={values:parseValues18(raw.values),images:parsedTeamImages18(raw.images),team18:raw.team18}")
# Preview counts and optional selection: user reviews every import source.
key="const rows=Object.keys(PROCESSES18).map(p=>"
assert s.count(key)==1
intro="""const extraRows=Object.entries(TEAM18_EXTRAS).map(([key,meta])=>{
 const received=countTeamExtra18(view.incoming,key),present=countTeamExtra18({values,images},key),done=view.repeated.has(key);
 return '<tr><td><label><input type="checkbox" class="team-extra18" value="'+key+'" '+
 (done||!received?'disabled': 'checked')+'> <b>'+escapeTeam18(meta.label)+'</b></label></td><td>'+
 received+' registro(s)'+(done?'<br><b>Já importado deste arquivo</b>':'')+
 '</td><td>'+present+' registro(s) no guia. '+
 (key==='inspectors'?'As informações novas serão acrescentadas para conferência.':
 key==='documents'?'Dados existentes serão preservados; apenas lacunas serão preenchidas.':
 'Posições existentes serão preservadas; anexos novos usarão espaços livres.')+
 '</td></tr>';
}).join('');
"""
s=s.replace(key,intro+key,1)
one("+rows+'</table></div><p id=\"teamError18\"","+rows+extraRows+'</table></div><p id=\"teamError18\"")
one("Identificação, fotos, rótulos, observações gerais dos processos (página 14), medidas adotadas e responsáveis do seu guia serão preservados. As observações da própria página de cada processo serão importadas junto com ele.",
    "Além dos processos, você pode importar documentos da página 15, fotos, rótulos e responsáveis pela inspeção. Os anexos existentes e as observações gerais (página 14) serão preservados. Os responsáveis recebidos serão acrescentados para conferência, sem apagar o texto anterior. As observações de cada processo acompanham a respectiva importação.")
# Keep preview and values unchanged if nothing is imported, reject repeated parts individually.
start=s.index("function applyTeam18(){")
end=s.index("function showTeam18(){",start)
old=s[start:end]
assert old.count("Object.assign(values,next)")==1
new=r"""function applyTeam18(){
 const view=TEAM18.preview;
 if(!view||TEAM18.busy)return;
 try{
  if(snapshotTeam18()!==view.base)throw Error('O guia foi alterado durante a conferência. Feche e selecione o arquivo novamente.');
  identityTeam18(view.incoming);
  if(view.legacy&&!document.querySelector('#same18')?.checked)
   throw Error('Confirme que o arquivo pertence à mesma inspeção.');
  const processes=[...document.querySelectorAll('.team-pick18:checked')].map(el=>el.value);
  const extras=[...document.querySelectorAll('.team-extra18:checked')].map(el=>el.value);
  const selected=[...processes,...extras];
  if(!selected.length)throw Error('Selecione pelo menos um processo, documento, conjunto de anexos ou responsáveis.');
  for(const key of selected)if(view.repeated.has(key))throw Error('Esta parte já foi importada deste arquivo: '+key);
  for(const p of processes){
   if(summary18(values,p).filled&&!document.getElementById('replace18_'+p)?.checked)
    throw Error('Autorize a substituição de '+p+' ou desmarque o processo.');
  }
  checkSourceLinks18(view.incoming.values,processes);
  const next={...values},nextImages={...images};
  for(const p of processes)for(const n of scopedFields18[p])next[n]=view.incoming.values[n];
  const stats=mergeTeamExtras18(next,nextImages,view.incoming,extras,view.file);
  cancelSpeech();
  Object.assign(values,next);
  Object.assign(images,nextImages);
  team18.imports.push({hash:view.hash,file:view.file,at:new Date().toISOString(),processes:selected});
  team18.imports=team18.imports.slice(-200);
  dirty=true;recalc();sync();
  document.querySelector('#teamModal18').remove();
  TEAM18.preview=null;
  const summary=selected.join(', ')+' de '+view.file+
   '. Documentos novos: '+stats.documents+
   ', fotos: '+stats.photos+', rótulos: '+stats.labels+
   ', informações de responsáveis: '+stats.inspectors+'.'+
   (stats.documentsKept?' '+stats.documentsKept+' documento(s) existente(s) preservado(s).':'')+
   ' Confira e critique os responsáveis importados antes de concluir o relatório. Salve o JSON consolidado.';
  document.querySelector('#status').textContent=summary;
  if(TEAM18.queue.length)nextTeam18();
 }catch(err){
  const box=document.querySelector('#teamError18');
  if(box){box.textContent=err.message;box.style.color='#a32020';}
 }
}
"""
s=s[:start]+new+s[end:]
# Explain in team instructions.
one("Depois completa fotos, rótulos, observações, medidas e responsáveis e salva o arquivo consolidado.",
    "Na importação selecione também documentos da página 15, fotos, rótulos e responsáveis da inspeção recebidos. As informações de responsáveis serão acrescentadas e conferidas antes da conclusão. Salve o arquivo consolidado.")

for token in ("const TEAM18_DOC_FIELDS=","function mergeTeamExtras18(","function appendInspectors18(","function applyTeam18(){"):
 assert s.count(token)==1,token
assert s.count("const extraRows=Object.entries(TEAM18_EXTRAS)")==1
assert s.count("class=\"team-extra18\"")==1
assert "Object.assign(images,nextImages)" in s
assert "obs_gerais_continuacao" not in helper
assert "function bpfPdfGeneralSplit(full,font,form,pdf){" in s
for term in ("function applyTeam18(){","const TEAM18_DOC_FIELDS="):
 pos=s.index(term);left=s.rfind('<script',0,pos);left=s.index('>',left)+1;right=s.index('</script>',pos)
 chk=subprocess.run(['node','--check'],input=s[left:right],capture_output=True,text=True)
 assert chk.returncode==0,(term,chk.stderr[:1200])
p.write_text(s,encoding='utf-8')
print("VALIDADO equipe.html: documentos 15, 12 fotos, 9 rótulos, responsáveis por acréscimo sem sobrescrita, conferência, importação atômica e JSON.")

# Update public link/cache to evict obsolete PWA shell.
index=Path('index.html');h=index.read_text(encoding='utf-8')
h,n=re.subn(r'href="((?:individual|equipe)\.html\?v=)[^"#]+(#[^"]*)?"',
 lambda m:'href="'+m.group(1)+'20261106-equipe-documentos-fotos-responsaveis'+(m.group(2) or '')+'"',h)
assert n==3,(n,'index should have individual, equipe and one review link')
index.write_text(h,encoding='utf-8')
sw=Path('sw-guia18.js');c=sw.read_text(encoding='utf-8')
c,n=re.subn(r"const CACHE='guia18-menu-[^']+';","const CACHE='guia18-menu-v26-bpf20261106-equipe-anexos';",c)
assert n==1,n
sw.write_text(c,encoding='utf-8')
