from pathlib import Path
import re
STYLE="""<style id="bpf-menu-compact-20261106">
header{background:#0b5c91!important;color:#fff;padding:14px 18px!important}
header h1{font-size:clamp(21px,5.2vw,28px)!important;line-height:1.2;margin:0 0 3px!important}
header p{font-size:13px!important;opacity:.9;margin:0!important}
.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 14px!important;background:#fff;border-bottom:1px solid #d1e0e8}
.toolbar button,.toolbar select{border-radius:9px!important;min-height:38px}
.toolbar #nav{flex:1 1 240px;min-width:0}
.toolbar #prev,.toolbar #next{min-width:41px}
.toolbar #save{background:#087aa9!important;color:#fff!important;font-weight:700}
.toolbar #removeImage{display:none!important}
.status{font-size:13px!important;margin:5px 14px!important;padding:4px 0!important}
#recoveryBar{padding:7px 12px!important;background:#f4f9fc!important;border:1px solid #c1d7e3!important;margin:9px 14px!important;border-radius:10px}
#recoveryBar summary{font-size:14px;font-weight:700;color:#174d6d;cursor:pointer;padding:5px 0}
#recoveryBar details[open] label{display:block;margin:8px 0}
#recoveryBar details[open] button{margin:5px 8px 6px 0}
#recoveryBar details span[role="status"]{display:block;font-size:12px;line-height:1.35;margin-top:5px}
.bpf-item-code{background:#dfecf5!important;gap:.13cqw!important}
.bpf-f{background:#086997!important;color:white!important;border:1.5px solid #064c70!important;border-radius:.32cqw!important;font-weight:900!important;box-shadow:0 1px 2px #123e5766;cursor:pointer;line-height:1.05!important;min-width:50%;text-shadow:0 1px 0 #004260}
.bpf-f:focus-visible{outline:2px solid #ffba39;outline-offset:1px}
@media print{.bpf-f{background:#fff!important;color:#084b74!important;border:1px solid #084b74!important;box-shadow:none!important;text-shadow:none!important}#recoveryBar{display:none!important}}
@media(max-width:650px){.toolbar{gap:6px!important;padding:10px 12px!important}.toolbar button{font-size:14px!important;padding:8px 11px!important}.toolbar select{font-size:16px!important;max-width:100%;order:0;flex-basis:calc(100% - 100px)}.toolbar #prev{order:0}.toolbar #next{order:0}.toolbar .zoom{width:100%;font-size:13px}}
</style>"""
def one(s,old,new,label):
    n=s.count(old)
    if n!=1: raise RuntimeError(f"{label}: {n} matches")
    return s.replace(old,new,1)
def update(name):
    p=Path(name);s=p.read_text(encoding="utf8")
    if 'bpf-menu-compact-20261106' in s: return
    prev=len(s)
    s=one(s,'<div style="padding:12px;background:#eaf6fa;color:#15384a;font:14px Arial" class="offline-note">Guia BPF para preenchimento no navegador. Use Salvar arquivo para guardar as respostas e Imprimir / PDF para gerar o formulário preenchível.</div><style>@media print{.offline-note{display:none}}</style>','','intro')
    s=one(s,'<header><h1>Guia Estadual de Avaliação do Risco Sanitário</h1><p>Envasadoras de Água Mineral · Revisão 6 · Formulário local para Chrome</p></header>','<header><h1>Guia de Avaliação de Risco</h1><p>Guia BPF · Água mineral</p></header>','title')
    s=one(s,'<button id="removeImage">Remover imagem</button>','<button id="removeImage" hidden style="display:none">Remover imagem</button>','image menu')
    m=re.search(r'<div class="help">.*?</div>(?=<input id="imageInput")',s,re.S)
    if not m or len(m.group())>3000: raise RuntimeError('help text missing')
    s=s[:m.start()]+s[m.end():]
    a=s.index('function bpfInspectorInstallMenu(){')
    b=s.index('\nfunction bpfInitFields(',a)
    if b-a>1500: raise RuntimeError('review menu function too large')
    s=s[:a]+"function bpfInspectorInstallMenu(){\n if(location.hash==='#revisar-inspetores')setTimeout(bpfInspectorOpenReview,100);\n}\n"+s[b:]
    s=one(s,"for(const[label,handler]of [['Trabalho em equipe',showTeam18],['Importar processos',()=>pickerTeam18.click()]])","for(const[label,handler]of [['Configurar equipe',showTeam18],['Importar processos',()=>pickerTeam18.click()]])",'team menu')
    s=one(s,"button.style.fontSize=100*Math.min(10,h*.34)/595.32+'cqw';button.style.minHeight=100*Math.min(13,h*.47)/595.32+'cqw';","button.style.fontSize=100*Math.min(13,h*.46)/595.32+'cqw';button.style.minHeight=100*Math.min(16,h*.57)/595.32+'cqw';",'F size')
    backup="bar.append(heading,intervalLabel,now,download,button,document.createElement('br'),msg,note);document.querySelector('.toolbar').after(bar);"
    if backup in s:
        s=one(s,backup,"const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Cópia de segurança';details.append(summary,intervalLabel,button,msg);bar.replaceChildren(details);document.querySelector('.toolbar').after(bar);",'compact backup')
    s=one(s,'</head><body>',STYLE+'</head><body>','style')
    if abs(len(s)-prev)>18000 or 'const GUIDE_DATA=' not in s or 'window.BPF=' not in s: raise RuntimeError('integrity check failed')
    p.write_text(s,encoding="utf8")
    print(name,'updated',prev,len(s))
for file in ('individual.html','equipe.html'):update(file)
p=Path('index.html');s=p.read_text(encoding='utf8')
if '<h1>Guia BPF</h1>' in s:
    s=one(s,'<h1>Guia BPF</h1>','<h1>Guia de Avaliação de Risco</h1>','homepage title')
    s=one(s,'<p class="subtitle">Avaliação do Risco Sanitário</p>','<p class="subtitle">Guia BPF · Água mineral</p>','homepage subtitle')
    s=s.replace('v=20261106-autofit-processos-html-pdf','v=20261106-menu-compact-f')
    p.write_text(s,encoding='utf8')
    print('homepage updated')
p=Path('sw-guia18.js');s=p.read_text(encoding='utf8')
if 'menu-v29' not in s:
    p.write_text(s.replace('menu-v28','menu-v29'),encoding='utf8')
    print('offline cache updated')
