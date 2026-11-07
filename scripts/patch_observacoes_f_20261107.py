from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CSS='''<style id="bpf-f-core-20261107">
@media screen{
.page>.bpf-item-code{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:42% 58%!important;gap:0!important;padding:0!important;z-index:50!important;isolation:isolate;visibility:visible!important;opacity:1!important;overflow:hidden!important}
.bpf-item-code>span{display:flex!important;align-items:center;justify-content:center;min-height:0;line-height:1;white-space:nowrap}
.page>.bpf-item-code>.bpf-f{position:relative!important;z-index:51!important;display:flex!important;align-items:center;justify-content:center;visibility:visible!important;opacity:1!important;box-sizing:border-box;width:100%!important;max-width:100%!important;height:100%!important;min-height:0!important;min-width:0!important;padding:0!important;line-height:1!important;align-self:stretch;background:#087aaa!important;color:#fff!important;border:1px solid #07577b!important;border-radius:2px!important}
.bpf-note-help{background:#edf5fa;border:1px solid #aac4d4;border-radius:6px;padding:9px;margin:8px 0;font:14px/1.4 Arial,sans-serif;color:#243f50;white-space:pre-wrap}
.bpf-note-tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:6px 0}.bpf-note-tools button{font:14px Arial;padding:7px 12px}.bpf-note-tools span{font:13px Arial;color:#405867}
}
</style>'''
HELP=r'''
// Instructions shown with each phrase observation; revisions travel in the guide JSON.
const BPF_NOTE_INSTRUCTION={text:'Orientações de preenchimento das observações das frases',guidance:'Registre as evidências verificadas para a frase ou as opções assinaladas: documentos e registros examinados, identificação, data, local, equipamento, lote ou amostra, quando pertinentes. Para Sim (OBS), descreva o que comprova o atendimento. Para Não (NC), descreva objetivamente a condição encontrada e o requisito não atendido, com a evidência correspondente. Para Não se aplica, quando permitido, justifique a não aplicabilidade. Em grupos, identifique a opção a que cada registro se refere. Utilize a orientação ao inspetor da respectiva frase para selecionar as verificações e evidências.'};
const bpfNoteInstructionEntry={key:'instructions:phrase-observations',page:0,code:'Observações',index:0,label:'Orientações gerais',scopes:[],appcc:'Preenchimento',original:{...BPF_NOTE_INSTRUCTION},refs:[BPF_NOTE_INSTRUCTION]};
BPF_INSPECTOR_ENTRIES.unshift(bpfNoteInstructionEntry);BPF_INSPECTOR_BY_KEY.set(bpfNoteInstructionEntry.key,bpfNoteInstructionEntry);
function bpfAttachNoteTools(area,parent,entries){
 const help=document.createElement('details');help.className='bpf-note-help';
 const summary=document.createElement('summary');summary.textContent='Como preencher esta observação';help.append(summary);
 const general=document.createElement('p');general.textContent=BPF_NOTE_INSTRUCTION.guidance;help.append(general);
 for(const text of [...new Set((entries||[]).map(e=>e.phrase.guidance).filter(Boolean))]){const p=document.createElement('p');p.textContent='Orientação ao inspetor: '+text;help.append(p);}
 parent.append(help);
 const tools=document.createElement('div');tools.className='bpf-note-tools';
 const paste=document.createElement('button');paste.type='button';paste.textContent='Colar';paste.setAttribute('aria-label','Colar no campo de observação');
 const status=document.createElement('span');status.setAttribute('role','status');
 paste.onclick=async()=>{
  if(area.disabled){status.textContent='Selecione Sim ou Não antes de colar.';return;}
  try{const text=await navigator.clipboard.readText();const start=area.selectionStart??area.value.length,end=area.selectionEnd??start;
   area.setRangeText(text,start,end,'end');area.dispatchEvent(new Event('input',{bubbles:true}));area.focus();status.textContent='Texto colado.';
  }catch(error){area.focus();status.textContent='Toque e mantenha pressionado o campo e escolha Colar, ou use Ctrl+V.';}
 };
 tools.append(paste,status);parent.append(tools);
}
'''
for name in ['individual.html','equipe.html']:
 p=ROOT/name;s=p.read_text()
 if 'bpf-f-core-20261107' not in s:s=s.replace('</head>',CSS+'</head>',1)
 if 'instructions:phrase-observations' not in s:
  marker='let bpfInspectorLastApplied=null,bpfInspectorLocalChecked=false;';assert marker in s;s=s.replace(marker,HELP+'\n'+marker,1)
  marker='noteLabel.append(area);card.append(noteLabel);';assert marker in s;s=s.replace(marker,marker+'bpfAttachNoteTools(area,card,panel.entries);',1)
  marker='label.append(area);box.append(label);';assert marker in s;s=s.replace(marker,marker+'bpfAttachNoteTools(area,box,panel.entries);',1)
  s=s.replace("const head=document.createElement('h3');head.textContent=(titles[entry.page]", "const head=document.createElement('h3');head.textContent=entry===bpfNoteInstructionEntry?entry.original.text:(titles[entry.page]",1)
  s=s.replace("for(const [field,titleText]of [['text','Texto da frase F'],['guidance','Orientação ao inspetor']])", "for(const [field,titleText]of (entry===bpfNoteInstructionEntry?[['guidance','Orientação de preenchimento']]:[['text','Texto da frase F'],['guidance','Orientação ao inspetor']]))",1)
  s=s.replace("restore.textContent='Restaurar original deste F';","restore.textContent=entry.key===bpfNoteInstructionEntry.key?'Restaurar orientação original':'Restaurar original deste F';")
 if 'bpf-review-open-button' not in s:
  marker='function bpfInspectorInstallMenu(){'
  assert marker in s
  s=s.replace(marker,marker+"""
 const button=document.createElement('button');button.type='button';button.id='bpf-review-open-button';button.textContent='Revisar frases dos inspetores';button.onclick=bpfInspectorOpenReview;
 document.querySelector('#print').after(button);
""",1)
 s=s.replace('20261107-obs-f4','20261107-obs-f5')
 # direct loading makes F sizing independent from a previously installed service worker
 if 'src="./interface-guia-amigavel.js' not in s:s=s.replace('</body>','<script src="./interface-guia-amigavel.js?v=20261107-obs-f5" defer></script></body>',1)
 p.write_text(s)
p=ROOT/'sw-guia18.js';s=p.read_text().replace('20261106-f3','20261107-obs-f4');p.write_text(s.replace('20261107-obs-f4','20261107-obs-f5'))
p=ROOT/'index.html';s=p.read_text().replace('20261106-f3','20261107-obs-f5').replace('20261107-obs-f4','20261107-obs-f5')
s=s.replace('href="./individual.html?v=20261107-obs-f5"', 'href="./individual.html?v=20261107-obs-f5#revisar-inspetores"')
p.write_text(s)
print('Updated both guides: core F layout, editable observation guidance and paste controls.')
