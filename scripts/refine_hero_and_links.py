from pathlib import Path
import re
from urllib.parse import quote

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_video = ".hero-video{width:106%;height:106%;position:absolute;inset:-3%;object-fit:cover;filter:brightness(.29) contrast(1.08) saturate(.87);transform:translate3d(0,var(--hero-y,0),0) scale(1.055)}"
new_video = ".hero-video{width:112%;height:108%;position:absolute;top:-4%;left:-4%;object-fit:cover;object-position:42% center;filter:brightness(.36) contrast(1.08) saturate(.9);transform:translate3d(-3.5%,var(--hero-y,0),0) scale(1.06)}"
if old_video not in s:
    raise SystemExit('CSS base do vídeo não encontrado')
s = s.replace(old_video, new_video, 1)

old_overlay = ".hero-media:after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,rgba(19,9,6,.95),rgba(19,9,6,.7) 38%,rgba(19,9,6,.38) 58%,rgba(19,9,6,.76)),linear-gradient(180deg,rgba(19,9,6,.45),rgba(19,9,6,.12) 35%,rgba(19,9,6,.85))}"
new_overlay = ".hero-media:after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,rgba(19,9,6,.93),rgba(19,9,6,.64) 37%,rgba(19,9,6,.28) 58%,rgba(19,9,6,.68)),linear-gradient(180deg,rgba(19,9,6,.38),rgba(19,9,6,.08) 42%,rgba(19,9,6,.78))}"
if old_overlay not in s:
    raise SystemExit('Overlay do hero não encontrado')
s = s.replace(old_overlay, new_overlay, 1)

mobile_marker = "@media(max-width:850px){body:before{display:none}"
mobile_repl = "@media(max-width:850px){body:before{display:none}.hero-video{width:110%;height:106%;top:-3%;left:-5%;object-position:48% center;transform:translate3d(0,var(--hero-y,0),0) scale(1.04)}"
if mobile_marker not in s:
    raise SystemExit('Media query mobile não encontrada')
s = s.replace(mobile_marker, mobile_repl, 1)

s = s.replace('<a class="scroll-cue" href="#sobre">Role para conhecer</a>', '', 1)

old_hero_note = 'Atendimento presencial em Valinhos e região de Campinas, além de atendimento online em todo o Brasil, com possibilidade de horário noturno mediante disponibilidade.'
new_hero_note = 'Atendimento presencial em Valinhos e região de Campinas. Atendimento online para clientes em todo o Brasil, com possibilidade de horário noturno mediante disponibilidade.'
s = s.replace(old_hero_note, new_hero_note, 1)

s = s.replace('O primeiro contato serve para apresentar brevemente sua solicitação e não substitui consulta jurídica individualizada.', 'O primeiro contato serve para apresentar brevemente sua solicitação e organizar os próximos passos.', 1)
s = s.replace('As informações deste site possuem caráter exclusivamente informativo e não substituem consulta jurídica individualizada.', 'Conteúdo jurídico de caráter informativo.', 1)

msg = 'Olá, Dra. Cíntia. Vim pelo site e gostaria de solicitar atendimento jurídico.'
wa_href = 'https://wa.me/5519998808725?text=' + quote(msg)

# Torna todos os links WhatsApp funcionais no HTML, mesmo se o JS não carregar.
s = re.sub(r'<a class="js-wa"(?![^>]*href=)', f'<a class="js-wa" href="{wa_href}"', s)
s = re.sub(r'<a class="float js-wa"(?![^>]*href=)', f'<a class="float js-wa" href="{wa_href}"', s)

# Pequeno reforço visual para links do rodapé sem perder sobriedade.
footer_style = '''\n<style id="footer-link-refine">\nfooter p a{color:var(--gold2);text-decoration:none;border-bottom:1px solid rgba(231,215,170,.22);transition:border-color .2s ease,color .2s ease}\nfooter p a:hover{color:#fff5d7;border-bottom-color:rgba(231,215,170,.7)}\n</style>\n'''
if 'id="footer-link-refine"' not in s:
    s = s.replace('</head>', footer_style + '</head>', 1)

p.write_text(s, encoding='utf-8')
