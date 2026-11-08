/* Reunificação dos quatro F1. Não altera requisitos legais, categorias, pesos ou respostas. */
(() => {
 'use strict';
 if(window.__bpfF1CorrecaoDiretaV60)return;
 window.__bpfF1CorrecaoDiretaV60=true;
 const CODES=['4.10.1','4.11.1','4.11.3','4.11.4'];
 const LABELS={
  '4.10.1':['Implementação do controle de qualidade','Documentação do controle de qualidade'],
  '4.11.1':['Supervisão dos manipuladores','Capacitação periódica dos manipuladores'],
  '4.11.3':['Curso de capacitação de 40 horas concluído há até dois anos','Curso de capacitação de 40 horas concluído há mais de dois anos — verificar atualização'],
  '4.11.4':['Captação','Condução','Reservatórios','Recepção','Higienização','Envase','Certificado do responsável pela industrialização']
 };
 const TEXT={
  '4.10.1':'F1 — Verificações: (1) IMPLEMENTAÇÃO do controle de qualidade; (2) DOCUMENTAÇÃO do controle de qualidade (Manual do Laboratório, POPs, métodos, plano de amostragem e registros). Avaliar ambos no mesmo F1.',
  '4.11.1':'F1 — Verificações: (1) SUPERVISÃO efetiva dos manipuladores; (2) CAPACITAÇÃO PERIÓDICA em higiene e boas práticas, comprovada por treinamento e registros. Avaliar ambos no mesmo F1.',
  '4.11.3':'F1 — Verificações: (1) CURSO COM CARGA HORÁRIA MÍNIMA DE 40 HORAS do responsável pela industrialização; (2) quando o CURSO FOI CONCLUÍDO HÁ MAIS DE DOIS ANOS, comprovação da atualização/reciclagem prevista no Guia. Se o curso tem até dois anos, registrar não aplicável para a segunda verificação.',
  '4.11.4':'F1 — Verificações: (1) CERTIFICADOS DOS MANIPULADORES dos processos aplicáveis (captação, condução, reservatórios, recepção, higienização e envase); (2) CERTIFICADO DO RESPONSÁVEL PELA INDUSTRIALIZAÇÃO com nome, data, carga horária e conteúdo. Avaliar ambos no mesmo F1.'
 };
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 let ran=false;
 const status={ready:false,items:[],checks:{},errors:[],legalUnchanged:true};
 window.BPF_F1_CORRECAO=status;
 function apply(){
  try{
   if(typeof BPF_PHRASES==='undefined'||!Array.isArray(BPF_PHRASES))return false;
   let updated=0;
   for(const page of BPF_PHRASES)for(const row of page.rows||[]){
    if(!CODES.includes(row.code)||!row.phrases?.[0])continue;
    // Alterar somente texto da verificação F1; NUNCA row.description.
    row.phrases[0].text=TEXT[row.code];
    const originalGuidance=String(row.phrases[0].guidance||'');
    if(!normalize(originalGuidance).includes(normalize(TEXT[row.code]).slice(0,25))){
     row.phrases[0].guidance=TEXT[row.code]+'\n'+originalGuidance;
    }
    for(const scope of row.scopes||[]){
     if(!scope.phrases?.[0])continue;
     scope.phrases[0].text=TEXT[row.code];
     const guidance=String(scope.phrases[0].guidance||'');
     if(!normalize(guidance).includes(normalize(TEXT[row.code]).slice(0,25)))scope.phrases[0].guidance=TEXT[row.code]+'\n'+guidance;
    }
    status.items.push(row.code);updated++;
   }
   if(!updated)return false;
   status.ready=true;
   ran=true;
   if(typeof bpfF1Checks==='function'&&!bpfF1Checks.__bpfF1CorrecaoV60){
    const original=bpfF1Checks;
    const fix=function(row,scope){
     const current=original(row,scope);
     const labels=LABELS[row?.code];
     if(!labels||!Array.isArray(current))return current;
     const result=current.map((entry,i)=>{
      const currentLabel=String(entry.option||'');
      let intended='';
      if(row.code==='4.11.4'){
       if(/industriali|respons[aá]vel/i.test(currentLabel))intended=LABELS[row.code][6];
       else if(i===6)intended=LABELS[row.code][6];
      }else if(labels[i])intended=labels[i];
      return intended&&entry.option!==intended?{...entry,option:intended}:entry;
     });
     status.checks[row.code]=result.map(x=>String(x.option||''));
     return result;
    };
    fix.__bpfF1CorrecaoV60=true;
    try{bpfF1Checks=fix}catch(e){status.errors.push('Não foi possível atualizar os rótulos internos: '+e.message)}
   }
   for(const code of CODES)if(!status.items.includes(code))status.errors.push('Não localizado: '+code);
   return true;
  }catch(e){status.errors.push(String(e));return false}
 }
 function done(){
  if(apply())return;
  let attempts=0;
  const timer=setInterval(()=>{if(apply()||++attempts>30)clearInterval(timer)},250);
 }
 // Executar após a restauração das revisões locais e após os scripts do formulário.
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(done,0),{once:true});
 else setTimeout(done,0);
})();