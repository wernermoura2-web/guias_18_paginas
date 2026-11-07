from pathlib import Path
import re

for filename in ('individual.html', 'equipe.html'):
    path = Path(filename)
    source = path.read_text(encoding='utf-8')
    if 'const BPF_NOTE_INSTRUCTION=' in source:
        source, count = re.subn(r'^// Instructions shown with each phrase observation;.*?^BPF_INSPECTOR_ENTRIES\.unshift\(bpfNoteInstructionEntry\);[^\n]*\n\n', '', source, count=1, flags=re.M|re.S)
        assert count == 1
        source = source.replace('entry===bpfNoteInstructionEntry?entry.original.text:', '')
        source = source.replace("entry===bpfNoteInstructionEntry?[['guidance','Orientação de preenchimento']]:", '')
        source = source.replace("entry.key===bpfNoteInstructionEntry.key?'Restaurar orientação original':", '')
        assert 'bpfNoteInstructionEntry' not in source
    source = source.replace('interface-guia-amigavel.js?v=20261107-identidade-f21','interface-guia-amigavel.js?v=20261107-R-ampliado-v23')
    path.write_text(source, encoding='utf-8')

for filename in ('index.html', 'revisao-frases.html'):
    path = Path(filename)
    source = path.read_text(encoding='utf-8').replace('20261107-definicoes-originais-v1','20261107-R-ampliado-v23')
    path.write_text(source, encoding='utf-8')
