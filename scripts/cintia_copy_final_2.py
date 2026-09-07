from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = 'Clareza jurídica para decisões que não podem ser tratadas no automático'
new = 'Clareza jurídica para decisões que não admitem respostas genéricas'
if old not in s:
    raise SystemExit('Headline original não encontrada')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
