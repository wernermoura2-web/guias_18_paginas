from pathlib import Path
for name in ('equipe.html','individual.html'):
    path=Path(name)
    source=path.read_text(encoding='utf-8')
    old="  group.lines.push('Frase '+(i+1)+', do item '+row.code"
    new="""  const grouped=bpfGroupedF2(row);
  const label=grouped&&i>0?'2, opção '+(grouped.indices.indexOf(i)+1):String(i+1);
  group.lines.push('Frase '+label+', do item '+row.code"""
    assert source.count(old)==1
    path.write_text(source.replace(old,new),encoding='utf-8')
