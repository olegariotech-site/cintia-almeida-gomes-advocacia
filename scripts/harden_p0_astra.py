from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Formulário: POST como fallback sem expor campos na URL; JS intercepta quando saudável.
s=s.replace(' action="#" method="post" onsubmit="event.preventDefault();return false;"',' action="#" method="post"',1)

# Mensagem WhatsApp: separador robusto sem escapes frágeis.
pattern=r"const d=new FormData\(form\),body=\[(.*?)\]\.join\(.*?\);status\.textContent"
m=re.search(pattern,s,re.S)
if not m:
    raise SystemExit('Construção da mensagem não encontrada')
items=m.group(1)
replacement="const d=new FormData(form),body=["+items+"].join(String.fromCharCode(10));status.textContent"
s=s[:m.start()]+replacement+s[m.end():]

# Vídeo é estático por padrão: JS só reproduz quando movimento é permitido.
s=s.replace('<video class="hero-video" autoplay muted loop playsinline preload="metadata"','<video class="hero-video" muted loop playsinline preload="metadata"',1)
s=s.replace("if(heroVideo&&videoToggle){if(reduce)setVideoState(true);videoToggle.addEventListener('click',()=>setVideoState(!heroVideo.paused));}","if(heroVideo&&videoToggle){setVideoState(reduce);videoToggle.addEventListener('click',()=>setVideoState(!heroVideo.paused));}",1)

p.write_text(s,encoding='utf-8')
