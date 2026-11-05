(function(){
'use strict';
function once(source,before,after,label){
 const first=source.indexOf(before);
 if(first<0||source.indexOf(before,first+before.length)>=0)throw Error('Versão incompatível: '+label);
 return source.slice(0,first)+after+source.slice(first+before.length);
}
function bpfPatchObservacoes(source){
 let s=source;
 s=once(s,'.text.bpf-process-observation[readonly]{background:#e9f6ff55;text-align:left;border:1px solid #9ab4c680}',
          '.text.bpf-process-observation{background:#e9f6ff55;text-align:left;border:1px solid #9ab4c680}','estilo');
 s=once(s,'el.readOnly=derived.has(w.name)||bpfObservationTargets.has(w.name);','el.readOnly=derived.has(w.name);','edição das observações');
 s=once(s,"el.setAttribute('aria-description','Observações preenchidas somente pelas frases F.');",
          "el.setAttribute('aria-description','Observação editável, com informações das frases F e complementos do inspetor.');",'acessibilidade');
 s=once(s,'el.oninput=()=>{if(bpfObservationTargets.has(w.name))return;values[w.name]=el.value;changed();recalc();fit(el)};',
          'el.oninput=()=>{values[w.name]=el.value;changed();recalc();fit(el)};','persistência');
 const a=s.indexOf('function fit(el){'),b=s.indexOf('\nfunction sync(){',a);
 if(a<0||b<0)throw Error('Versão incompatível: dimensionamento do texto');
 const sizing=[
 "function fit(el){",
 " if(!el.classList.contains('text')||!el.clientHeight||!el.clientWidth)return;",
 " const name=el.dataset.field||'';",
 " const observation=el.classList.contains('bpf-process-observation')||/OBSERV|^OBS\\s*\\d|CONSIDERAÇÕES FINAIS/i.test(name);",
 " const maxSize=Math.min(14,Math.max(8,el.clientHeight*.55));",
 " let size=maxSize;el.style.fontSize=size+'px';",
 " const fits=()=>el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1;",
 " if(!fits()){",
 "  let low=observation?1:3,high=maxSize;",
 "  for(let attempt=0;attempt<13;attempt++){",
 "   const middle=(low+high)/2;el.style.fontSize=middle+'px';",
 "   if(fits())low=middle;else high=middle;",
 "  }",
 "  size=low;",
 " }",
 " el.style.fontSize=size+'px';",
 " const mirror=el.parentElement.querySelector('.printable[data-field='+JSON.stringify(name)+']');",
 " if(mirror)mirror.style.fontSize=(size/el.parentElement.clientWidth*100)+'cqw';",
 "}"
 ].join('\n');
 // The target viewer uses one PDF page per printed page: fit the font, not the height of the absolute-positioned field.
 s=s.slice(0,a)+sizing+s.slice(b);
 s=once(s,"if(Object.entries(BPF_OBSERVATION_FIELDS).some(([key,field])=>/^\\d+_/.test(key)&&Number(key.split('_')[0])<13&&field===name))f.enableReadOnly();",
          "if(Object.entries(BPF_OBSERVATION_FIELDS).some(([key,field])=>/^\\d+_/.test(key)&&Number(key.split('_')[0])<13&&field===name))f.enableMultiline();",'PDF editável');
 s=once(s,"f.acroField.setDefaultAppearance('/Helv '+size+' Tf 0 g');f.defaultUpdateAppearances(observationFont);",
          "f.acroField.setDefaultAppearance('/Helv '+size+' Tf 0 g');f.defaultUpdateAppearances(observationFont);f.acroField.setDefaultAppearance('/Helv 0 Tf 0 g');",'PDF auto dimensionado');
 return s;
}
globalThis.bpfPatchObservacoes=bpfPatchObservacoes;
})();