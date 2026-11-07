from pathlib import Path

def patch(s):
    def change(a,b):
        nonlocal s
        assert s.count(a)==1,(a[:125],s.count(a))
        s=s.replace(a,b)
    if 'BPF_MATRIX_PCC_BAND' in s:return s
    for text in [
        "{label:'F1 — Responsabilidade pela industrialização',indices:range(0,2),composite:true}",
        "{label:'F2 — Habilitação nos conselhos profissionais',indices:range(3,5),composite:true}",
    ]:
        change(text,text[:-1]+",allowNA:true}")
    change("(panel.allowNA&&values[e.name]==='2')","(panel.allowNA&&panel.entries.length===1&&values[e.name]==='2')")
    change("(a==='2'&&panel.allowNA)", "(a==='2'&&panel.allowNA&&panel.entries.length===1)")
    change(":'Marque uma ou várias opções e atribua uma única resposta Sim ou Não ao grupo.';card.append(hint);",
           ":(panel.allowNA?'Marque as opções e escolha uma resposta Sim, Não ou NA.':'Marque uma ou várias opções e atribua uma única resposta Sim ou Não ao grupo.');card.append(hint);")
    change("if(row.code==='4.11.2'&&panel.id===1&&panel.entries.some", "if(row.code==='4.11.2'&&answer!=='2'&&panel.id===1&&panel.entries.some")
    change("const units=page.page===11?[]:", "const units=[11,12].includes(page.page)?[]:")
    change("const scopeText=page.page===11&&!panel.composite?", "const scopeText=[11,12].includes(page.page)&&!panel.composite?")
    change(" const pending=bpfInspectorDecode(values.BPF_InspectorRevisions);", """ const pending=bpfInspectorDecode(values.BPF_InspectorRevisions);
 const reviewOrder=new Map();
 for(const page of BPF_PHRASES)for(const [rowIndex,row] of page.rows.entries()){
  const panels=bpfPanels(page,row);
  for(const panel of panels){
   reviewOrder.set(bpfExampleKey(page,row.code,panel),[rowIndex,panel.id,1,0]);
   const indices=panel.indices||[0];
   indices.forEach((index,option)=>reviewOrder.set(page.page+':'+row.code+':'+index,[rowIndex,panel.id,0,option]));
  }
 }
 function compareReview(a,b){
  const position=e=>reviewOrder.get(e.key)||reviewOrder.get(e.page+':'+e.code+':'+e.index)||[0,0,0,0];
  const x=position(a),y=position(b);
  return a.page-b.page||x[0]-y[0]||x[1]-y[1]||x[2]-y[2]||x[3]-y[3];
 }""")
    change("""const filtered=BPF_INSPECTOR_ENTRIES.filter(e=>
   (!pageFilter""", """const filtered=BPF_INSPECTOR_ENTRIES.filter(e=>
   !(e.page===9&&e.code==='4.7.3')&&(!pageFilter""")
    change("toLocaleLowerCase('pt-BR').includes(keyword))));", "toLocaleLowerCase('pt-BR').includes(keyword)))).sort(compareReview);")
    change("(entry.scopes.length>1?' — '+entry.scopes", "([11,12].includes(entry.page)?'':entry.scopes.length>1?' — '+entry.scopes")
    change("   const entry={key,page:page.page,code:row.code,index:i,label:", """   const reviewGroup=bpfPanels(page,row).find(p=>p.indices?.includes(i));
   const groupedLabel=['4.3.3','4.11.2'].includes(row.code)&&reviewGroup?
    'F'+(reviewGroup.id+1)+' — '+bpfUnifiedOption(row,reviewGroup.entries.find(e=>e.index===i)):null;
   const entry={key,page:page.page,code:row.code,index:i,label:groupedLabel??(""")
    change("'F'+(i+1),scopes:collection", "'F'+(i+1)),scopes:collection")
    begin=s.index('/* Nota metodologica visivel na matriz')
    end=s.index('function place(',begin)
    s=s[:begin]+"""/* Faixa vermelha dos seis primeiros processos na matriz. Coordenadas em pontos da página. */
const BPF_MATRIX_PCC_BAND={left:100,right:348,top:185,bottom:222.5,width:595.32,height:841.92};
const BPF_MATRIX_PCC_TEXT='Regra PCC — Não atendimento de qualquer requisito classificado como PCC';
const bpfRiskRule=document.createElement('div');
bpfRiskRule.id='bpf-faixa-pcc-matriz';
const band=BPF_MATRIX_PCC_BAND;
bpfRiskRule.style.cssText='position:absolute;left:'+100*band.left/band.width+'%;top:'+100*band.top/band.height+'%;width:'+100*(band.right-band.left)/band.width+'%;height:'+100*(band.bottom-band.top)/band.height+'%;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:1fr 1fr;background:#e04c47;color:#111;pointer-events:none';
for(let i=0;i<6;i++){
 const cell=document.createElement('span');
 cell.textContent='ALTO';
 cell.style.cssText='display:grid;place-items:center;border-right:1px solid #94443e;font:1.1cqw Arial,sans-serif';
 bpfRiskRule.append(cell);
}
const pccText=document.createElement('span');
pccText.textContent=BPF_MATRIX_PCC_TEXT;
pccText.style.cssText='grid-column:1/-1;display:grid;place-items:center;border-top:1px solid #94443e;color:#fff;font:bold .94cqw Arial,sans-serif;text-align:center;white-space:nowrap';
bpfRiskRule.append(pccText);host.children[17].append(bpfRiskRule);
"""+s[end:]
    begin=s.index(' const bpfPccRuleFont=')
    end=s.index(' bpfPreparePhotoPdf',begin)
    s=s[:begin]+""" const pccPage=pdf.getPage(17),pccBold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 const {left,right,top,bottom,height}=BPF_MATRIX_PCC_BAND;
 const bandWidth=right-left,half=(bottom-top)/2,split=height-top-half;
 const border=PDFLib.rgb(.58,.27,.24),ink=PDFLib.rgb(.08,.08,.08);
 pccPage.drawRectangle({x:left+.2,y:height-bottom+.2,width:bandWidth-.4,height:bottom-top-.4,color:PDFLib.rgb(.878,.298,.278)});
 pccPage.drawLine({start:{x:left,y:split},end:{x:right,y:split},thickness:.45,color:border});
 for(let i=0;i<6;i++){
  const x=left+bandWidth*i/6;
  if(i)pccPage.drawLine({start:{x,y:split},end:{x,y:height-top},thickness:.45,color:border});
  pccPage.drawText('ALTO',{x:x+bandWidth/12-observationFont.widthOfTextAtSize('ALTO',7.4)/2,y:split+half/2-2.6,size:7.4,font:observationFont,color:ink});
 }
 const pccSize=Math.min(7.4,(bandWidth-9)/pccBold.widthOfTextAtSize(BPF_MATRIX_PCC_TEXT,1));
 pccPage.drawText(BPF_MATRIX_PCC_TEXT,{x:left+(bandWidth-pccBold.widthOfTextAtSize(BPF_MATRIX_PCC_TEXT,pccSize))/2,y:height-bottom+half/2-pccSize*.35,size:pccSize,font:pccBold,color:PDFLib.rgb(1,1,1)});
"""+s[end:]
    change("function bpfUnifiedRow(row){return ['4.10.2','4.10.3','4.11.2'].includes(row.code);}", "function bpfUnifiedRow(row){return ['4.10.3','4.11.2'].includes(row.code);}")
    change("if(!bpfUnifiedRow(row)&&row.code!=='4.3.3')continue;", "if(!bpfUnifiedRow(row)&&!['4.3.3','4.10.2'].includes(row.code))continue;")
    change("(row.code==='4.3.3'&&panel.id===0)", "(['4.3.3','4.10.2'].includes(row.code)&&panel.id===0)")
    change("['Laboratório próprio','Laboratório terceirizado','Contrato de terceirização']", "['Laboratório interno (próprio)','Laboratório externo (terceirizado)','Contrato de terceirização']")
    change("if(bpfGroupedF2(row)&&panel.id===1){", "if((bpfGroupedF2(row)&&panel.id===1)||(row.code==='4.10.2'&&panel.id===0)){")
    change("  }else{\n   for(const scope of row.scopes){\n    const started=", "  }else if(row.code!=='4.10.2'){\n   for(const scope of row.scopes){\n    const started=")
    change("  // Mantém os campos individuais internos para cálculos, JSON antigo e Anexo F.", """  if(row.code==='4.10.2'&&panels[0].entries.some(e=>['1','0'].includes(values[e.name]))){
   for(const e of panels[0].entries)if(!values[e.name])values[e.name]='2';
  }
  // Mantém os campos individuais internos para cálculos, JSON antigo e Anexo F.""")
    change("const units=[11,12].includes(page.page)?[]:", "const units=row.code==='4.10.2'&&panel.id===0?selected.map(e=>bpfUnifiedOption(row,e)):[11,12].includes(page.page)?[]:")
    return s

for name in ('equipe.html','individual.html'):
    path=Path(name)
    path.write_text(patch(path.read_text(encoding='utf-8')),encoding='utf-8')
for name in ('index.html','revisao-frases.html','sw-guia18.js'):
    path=Path(name)
    path.write_text(path.read_text().replace('20261107-controle-qualidade-v33','20261107-matriz-revisao-v34').replace('guia18-controle-qualidade-20261107-v33','guia18-matriz-revisao-20261107-v34'))

test=Path('scripts/test_pcc_alto_risco_20261107.cjs')
test.write_text(test.read_text().replace('bpfPccRulePage.drawText','pccPage.drawText(BPF_MATRIX_PCC_TEXT').replace('bpf-regra-pcc-matriz','bpf-faixa-pcc-matriz'))
