from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# 1) Corrige erro de sintaxe no join da mensagem do formulário.
s = s.replace("].join('\n');", "].join('\\n');")
# Caso a quebra literal já esteja gravada dentro das aspas:
s = s.replace("].join('" + "\n" + "');", "].join('\\n');")

# 2) Fail-safe: nunca permitir GET/acidente se o JS principal falhar.
s = s.replace('<form class="form contact-card reveal" id="contactForm">', '<form class="form contact-card reveal" id="contactForm" action="#" method="post" onsubmit="event.preventDefault();return false;">', 1)

# 3) Contraste acessível para texto dourado em fundos claros.
s = s.replace("--gold2:#e7d7aa;--cream", "--gold2:#e7d7aa;--gold-ink:#775326;--cream", 1)
contrast_css = '''\n/* P0 acessibilidade: dourado decorativo permanece; texto em fundo claro usa tom mais escuro */\n.about .role,.areas .label,.areas .area-num,.principles .label,.process .label,.insights .label,.insights .insight-tag,.faq .label,.contact .label{color:var(--gold-ink)}\n'''
s = s.replace('</style>', contrast_css + '</style>', 1)

# 4) Controle explícito do vídeo do hero.
video_button = '<button class="video-toggle" id="videoToggle" type="button" aria-pressed="false" aria-label="Pausar animação do fundo">Pausar animação</button>'
needle = '</video></div><div class="orbit"'
if needle in s and 'id="videoToggle"' not in s:
    s = s.replace('</video></div><div class="orbit"', '</video></div>' + video_button + '<div class="orbit"', 1)

video_css = '''\n.video-toggle{position:absolute;z-index:5;right:22px;bottom:22px;padding:8px 11px;border:1px solid rgba(231,215,170,.35);background:rgba(19,9,6,.58);backdrop-filter:blur(10px);color:#fffdf8d9;font:600 9px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.22s}\n.video-toggle:hover{border-color:rgba(231,215,170,.68);background:rgba(19,9,6,.78)}\n.video-toggle:focus-visible{outline:2px solid var(--gold2);outline-offset:3px}\n@media(max-width:850px){.video-toggle{right:14px;bottom:14px;font-size:8px}}\n'''
s = s.replace('</style>', video_css + '</style>', 1)

# 5) Vídeo respeita reduced motion e pode ser pausado/reiniciado sem depender do restante do motion.
video_js = '''\n  const heroVideo=document.querySelector('.hero-video'),videoToggle=document.getElementById('videoToggle');\n  const setVideoState=(paused)=>{if(!heroVideo||!videoToggle)return;if(paused){heroVideo.pause();videoToggle.textContent='Reproduzir animação';videoToggle.setAttribute('aria-pressed','true');videoToggle.setAttribute('aria-label','Reproduzir animação do fundo')}else{heroVideo.play().catch(()=>{});videoToggle.textContent='Pausar animação';videoToggle.setAttribute('aria-pressed','false');videoToggle.setAttribute('aria-label','Pausar animação do fundo')}};\n  if(heroVideo&&videoToggle){if(reduce)setVideoState(true);videoToggle.addEventListener('click',()=>setVideoState(!heroVideo.paused));}\n'''
anchor = "  const waBase='https://wa.me/5519998808725?text=';"
if anchor in s and 'const heroVideo=' not in s:
    s = s.replace(anchor, anchor + video_js, 1)

# 6) Em reduced motion, neutraliza também vídeo/parallax visual.
reduce_css = '''\n@media (prefers-reduced-motion:reduce){.hero-video{transform:none!important}.orbit{transform:none!important}.progress{display:none}.video-toggle{display:none}}\n'''
s = s.replace('</style>', reduce_css + '</style>', 1)

p.write_text(s, encoding='utf-8')
