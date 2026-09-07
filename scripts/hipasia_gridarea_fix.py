from pathlib import Path
p=Path('styles.css')
s=p.read_text(encoding='utf-8')
needle='.hero-signature {\n  position: absolute;\n  z-index: 1;\n  left: -56px;'
replacement='.hero-signature {\n  grid-area: auto;\n  position: absolute;\n  z-index: 1;\n  left: -56px;'
if needle not in s:
    raise SystemExit('hero signature override not found')
s=s.replace(needle,replacement,1)
p.write_text(s,encoding='utf-8')
