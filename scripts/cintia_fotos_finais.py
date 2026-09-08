from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
hero_old = 'src="assetsdra-cintia-retrato.png.jpeg?v=20260528b" alt="Dra. Cíntia Pereira Almeida Gomes" width="1254" height="1254" fetchpriority="high"'
hero_new = 'src="assetsdra-cintia-hero.png?v=20260908a" alt="Dra. Cíntia Pereira Almeida Gomes" fetchpriority="high"'
sobre_old = 'src="assetsdra-cintia-retrato.png.jpeg?v=20260528b" alt="Dra. Cíntia Pereira Almeida Gomes" width="1254" height="1254" loading="lazy"'
sobre_new = 'src="assetsdra-cintia-sobre.png?v=20260908a" alt="Dra. Cíntia Pereira Almeida Gomes" loading="lazy"'
if hero_old not in s:
    raise SystemExit('Imagem antiga do hero não encontrada')
if sobre_old not in s:
    raise SystemExit('Imagem antiga do Sobre não encontrada')
s = s.replace(hero_old, hero_new, 1)
s = s.replace(sobre_old, sobre_new, 1)
p.write_text(s, encoding='utf-8')
