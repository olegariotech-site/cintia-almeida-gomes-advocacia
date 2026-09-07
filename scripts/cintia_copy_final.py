from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = '''<div class="experience-note">\n<span class="label">Vivência imobiliária. Olhar jurídico.</span>\n<p>Experiência prática para compreender locações, contratos e relações condominiais, com assessoria a síndicos e administradoras.</p>\n</div>'''
new = '''<div class="experience-note">\n<span class="label">1. Foco no equilíbrio de direitos e deveres</span>\n<p>Experiência prática para analisar e resguardar os direitos e obrigações de locadores e locatários, com atuação em contratos imobiliários e assessoria a síndicos e administradoras.</p>\n</div>'''
if old not in s:
    raise SystemExit('Trecho original não encontrado')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
