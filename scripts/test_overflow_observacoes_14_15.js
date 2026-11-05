#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert').strict;
for(const file of ['individual.html','equipe.html']){
 const html=fs.readFileSync(file,'utf8'),i=html.indexOf('function bpfGeneralFullText(){'),j=html.indexOf('function bpfSyncNCLists(){',i);
 assert(i>=0 && j>i, file+': funções de fluxo ausentes');
 const helper=html.slice(i,j);
 const first=makeElement('OBS 1',506,617),second=makeElement('obs_gerais_continuacao',559,460);
 const values={'OBS 1':'',obs_gerais_continuacao:'',BPF_ObsGeneralFlow:''};
 const context={values,document:{
  querySelector(s){
   if(s==='textarea[data-field="OBS 1"]')return first;
   if(s==='textarea[data-field="obs_gerais_continuacao"]')return second;
   if(s==='#status')return {textContent:''};
   return null;
  },
  createElement(type){assert.equal(type,'textarea');return makeProbe();}
 },getComputedStyle:()=>({fontFamily:'Arial',fontWeight:'400',padding:'0px'}),Object,JSON,String,Array,Math,Number};
 vm.createContext(context);vm.runInContext(helper,context);
 const full=Array.from({length:95},(_,i)=>'Registro de não conformidade '+(i+1)+': item 4.3.5; PCC; unidade Reservatório '+(i%4+1)+'.').join('\n');
 values['OBS 1']=full;
 context.bpfGeneralFlow(context.bpfGeneralFullText());
 assert(values['OBS 1'].length>0 && values.obs_gerais_continuacao.length>0,file+': não realizou quebra automática');
 assert.equal(values['OBS 1']+values.obs_gerais_continuacao,full,file+': perda ou duplicação na divisão');
 let meta=JSON.parse(values.BPF_ObsGeneralFlow);
 assert.equal(meta.full,full,file+': texto original não preservado em JSON');
 assert.equal(context.bpfGeneralFullText(),full,file+': recomposição incorreta');
 const oldA=values['OBS 1'],oldB=values.obs_gerais_continuacao;
 context.bpfGeneralFlow(context.bpfGeneralFullText());
 assert.equal(values['OBS 1'],oldA);assert.equal(values.obs_gerais_continuacao,oldB);
 values['OBS 1']='TESTE: '+values['OBS 1'];
 const modified=context.bpfGeneralFullText();
 assert.equal(modified,'TESTE: '+full);
 context.bpfGeneralFlow(modified);
 assert.equal(values['OBS 1']+values.obs_gerais_continuacao,modified,file+': edição manual da página 14 foi perdida');
 values['OBS 1']='Texto breve';
 values.obs_gerais_continuacao='';
 values.BPF_ObsGeneralFlow='';
 context.bpfGeneralFlow(context.bpfGeneralFullText());
 assert.equal(values['OBS 1'],'Texto breve');assert.equal(values.obs_gerais_continuacao,'');
 assert(html.includes("function sync(){bpfGeneralFlow(bpfGeneralFullText());"),file+': rotina de sincronização não foi atualizada');
 assert(html.includes('let priorText=bpfGeneralFullText()'),file+': NC ainda usa só página 14');
 assert(html.includes('D.fields.BPF_ObsGeneralFlow='),file+': metadata do JSON não será mantida');
 console.log('TESTES OK',file,'página 14 para 15: inteiro, editável, JSON preservado, sincronização NC.');
}
function makeElement(id,width,height){
 const el={dataset:{field:id},className:'overlay text',clientWidth:width,clientHeight:height,
 parentElement:{appendChild(){},clientWidth:width}};
 return el;
}
function makeProbe(){
 const obj={style:{},className:'',value:'',remove(){}};
 Object.defineProperty(obj,'clientWidth',{get(){return parseFloat(obj.style.width)||1;}});
 Object.defineProperty(obj,'clientHeight',{get(){return parseFloat(obj.style.height)||1;}});
 Object.defineProperty(obj,'scrollWidth',{get(){return obj.clientWidth;}});
 Object.defineProperty(obj,'scrollHeight',{get(){
  const px=parseFloat(obj.style.fontSize)||11,unit=Math.max(1,Math.floor(obj.clientWidth/(px*.57)));
  const total=obj.value.split('\n').reduce((sum,x)=>sum+Math.max(1,Math.ceil(x.length/unit)),0);
  return Math.max(obj.clientHeight,Math.ceil(total*px*1.25));
 }});
 return obj;
}
