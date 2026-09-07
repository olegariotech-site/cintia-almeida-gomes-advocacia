from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = 'cintiapalmeida@adv.oabsp.org.br<br>WhatsApp: (19) 99880-8725</p>'
new = '<a href="mailto:cintiapalmeida@adv.oabsp.org.br">cintiapalmeida@adv.oabsp.org.br</a><br><a class="js-wa" target="_blank" rel="noopener noreferrer">WhatsApp: (19) 99880-8725</a></p>'
if old not in s:
    raise SystemExit('Trecho do rodapé não encontrado')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
