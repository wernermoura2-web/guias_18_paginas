#!/usr/bin/env python3
"""Regra PCC na classificação do Guia BPF/APPCC, individual e equipe.
Ao menos uma frase PCC marcada como Nao -> processo Alto Risco;
conserva percentuais e respostas originais, com atualização em HTML e PDF.
"""
from pathlib import Path
import json
import re
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]
RULE='REGRA PCC: Qualquer PCC não atendido classifica o processo como ALTO RISCO, independentemente do percentual.'
PDF_RULE='REGRA PCC: Qualquer PCC nao atendido classifica o processo como ALTO RISCO, independentemente do percentual.'
HELPER=r"""
/* Regra de criticidade APPCC: PCC com resposta Nao prevalece sobre percentuais. */
const BPF_PCC_RISK_MAP=[
 {pages:[0],units:{0:['Dropdown1','Dropdown2','Dropdown3','Dropdown4']},finals:{0:'Dropdown5'},matrix:'Dropdown67',score:'Dropdown300'},
 {pages:[1],units:{1:['Dropdown6','Dropdown113','Dropdown8','Dropdown9']},finals:{1:'Dropdown10'},matrix:'Dropdown66',score:'Dropdown301'},
 {pages:[2,3,4,5],units:{2:['Dropdown11','Dropdown12','Dropdown13','Dropdown14'],3:['Dropdown16','Dropdown17','Dropdown18','Dropdown19'],4:['Dropdown21','Dropdown22','Dropdown23','Dropdown24'],5:['Dropdown26','Dropdown27','Dropdown28','Dropdown29']},finals:{2:'Dropdown15',3:'Dropdown20',4:'Dropdown25',5:'Dropdown30'},matrix:'Dropdown65',score:'Dropdown302'},
 {pages:[6],units:{6:['Dropdown31','Dropdown32','Dropdown33','Dropdown34']},finals:{6:'Dropdown35'},matrix:'Dropdown64',score:'Dropdown303'},
 {pages:[7,8],units:{7:['Dropdown36','Dropdown37','Dropdown38','Dropdown39'],8:['Dropdown41','Dropdown42','Dropdown43','Dropdown44']},finals:{7:'Dropdown40',8:'Dropdown45'},matrix:'Dropdown63',score:'Dropdown304'},
 {pages:[9,10],units:{9:['Dropdown46','Dropdown47','Dropdown48','Dropdown49'],10:['Dropdown51','Dropdown52','Dropdown53','Dropdown54']},finals:{9:'Dropdown50',10:'Dropdown55'},matrix:'Dropdown61',score:'Dropdown305'},
 {pages:[11],units:{},finals:{11:'Dropdown56'},matrix:'Dropdown60',score:'Dropdown306'},
 {pages:[12],units:{},finals:{12:'Dropdown57'},matrix:'Dropdown62',score:'Dropdown307'}
];
function bpfPCCNaoAtendidos(){
 const failures=new Map();
 for(const page of BPF_PHRASES)for(const row of page.rows)for(const scope of row.scopes){
  for(let i=0;i<scope.phrases.length;i++){
   if(scope.phrases[i].appcc!=='PCC'||values[bpfPhraseName(scope,i)]!=='0')continue;
   if(!failures.has(page.page))failures.set(page.page,new Set());
   failures.get(page.page).add(Number(scope.col));
  }
 }
 return failures;
}
function bpfOverridePCCRisk(){
 const failures=bpfPCCNaoAtendidos();
 for(const cfg of BPF_PCC_RISK_MAP){
  let failed=false;
  for(const page of cfg.pages){
   const units=failures.get(page);
   if(!units||!units.size)continue;
   failed=true;
   if(cfg.finals[page])values[cfg.finals[page]]='ALTO';
   for(const unit of units){
    const dropdown=cfg.units[page]?.[unit-1];
    if(!dropdown)continue;
    values[dropdown]='ALTO';
    // Tambem atualizar a celula correspondente da unidade na matriz.
    const percentage=D.fields[dropdown]?.calc?.match(/this\.getField\("([^"]+)"\)/)?.[1];
    if(!percentage)continue;
    for(const widget of D.widgets){
     if(widget.page!==17)continue;
     const f=D.fields[widget.name];
     if(f?.type!=='/Ch'||!f.options?.includes('3')||!f.options?.includes('1'))continue;
     if(/var controle1/.test(f.calc||''))continue;
     const inputs=[...(f.calc||'').matchAll(/this\.getField\("([^"]+)"\)/g)].map(m=>m[1]);
     if(inputs.length===1&&inputs[0]===percentage)values[widget.name]='3';
    }
   }
  }
  if(failed){
   values[cfg.matrix]='ALTO';
   values[cfg.score]='3';
  }
 }
}
"""
DOM=r"""
/* Nota metodologica visivel na matriz e na impressao do guia. */
const bpfRiskRule=document.createElement('div');
bpfRiskRule.id='bpf-regra-pcc-matriz';
bpfRiskRule.textContent=__RULE__;
bpfRiskRule.style.cssText='position:absolute;left:7%;top:65.55%;width:86%;height:1.65%;font:bold 0.86cqw Arial,sans-serif;text-align:center;line-height:1.1;white-space:nowrap;color:#a11414;pointer-events:none';
host.children[17].append(bpfRiskRule);
"""
PDF=r"""
 const bpfPccRuleFont=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold),bpfPccRulePage=pdf.getPage(17);
 const bpfPccRuleText=__PDF_RULE__,bpfPccRuleSize=Math.min(7.4,510/bpfPccRuleFont.widthOfTextAtSize(bpfPccRuleText,7.4)*7.4);
 bpfPccRulePage.drawText(bpfPccRuleText,{x:42,y:285.5,size:bpfPccRuleSize,font:bpfPccRuleFont,color:PDFLib.rgb(0.56,0.07,0.07)});
"""
DOM=DOM.replace('__RULE__',json.dumps(RULE,ensure_ascii=False))
PDF=PDF.replace('__PDF_RULE__',json.dumps(PDF_RULE,ensure_ascii=False))

def replace_once(source,needle,replacement,name):
    assert source.count(needle)==1,(name,source.count(needle))
    return source.replace(needle,replacement,1)

def check_js(source,marker):
    i=source.index(marker)
    a=source.rindex('<script',0,i)
    b=source.index('>',a)+1
    c=source.index('</script>',i)
    with tempfile.NamedTemporaryFile(mode='w',suffix='.js',encoding='utf-8') as f:
        f.write(source[b:c]);f.flush()
        subprocess.run(['node','--check',f.name],check=True)

def patch(path):
    s=path.read_text(encoding='utf-8')
    if 'function bpfOverridePCCRisk(){' in s:
        assert s.count('function bpfOverridePCCRisk(){')==1
        print(path.name,'ja atualizado')
        return
    assert 'const BPF_PHRASES=' in s
    assert 'const GUIDE_DATA=' in s
    assert 'function bpfApplyAnswers(v){' in s
    s=replace_once(s,'function recalc(){',HELPER+'\nfunction recalc(){','recalc')
    marker=" const levels=['Dropdown60','Dropdown61','Dropdown62','Dropdown63','Dropdown64','Dropdown65','Dropdown66','Dropdown67'].map(n=>values[n]);"
    s=replace_once(s,marker,' bpfOverridePCCRisk();\n'+marker,'recalc antes do agregado geral')
    s=replace_once(s,'function place(el,w){',DOM+'function place(el,w){','nota na matriz')
    s=replace_once(s,' bpfPreparePhotoPdf(pdf,form,observationFont);',PDF+' bpfPreparePhotoPdf(pdf,form,observationFont);','nota no PDF editavel')
    assert s.count('bpfOverridePCCRisk();')==1
    check_js(s,'function bpfOverridePCCRisk(){')
    check_js(s,'async function bpfExportEditable(){')
    path.write_text(s,encoding='utf-8')
    print(path.name,'modificado, bytes',len(s.encode()))

def main():
    for name in ('individual.html','equipe.html'):patch(ROOT/name)
    index=ROOT/'index.html'
    s=index.read_text(encoding='utf-8')
    s,n=re.subn(r'(href="./(?:individual|equipe)\.html\?v=)[^"]+',r'\g<1>20261107-pcc-alto-automatico',s)
    assert n==2
    index.write_text(s,encoding='utf-8')
    sw=ROOT/'sw-guia18.js'
    s=sw.read_text(encoding='utf-8')
    s,n=re.subn(r"const CACHE='[^']+';", "const CACHE='guia18-pcc-alto-20261107-v1';",s,count=1)
    assert n==1
    sw.write_text(s,encoding='utf-8')
    print('Regra PCC publicada nas duas modalidades; versao/cache alterados.')

if __name__=='__main__':
    main()
