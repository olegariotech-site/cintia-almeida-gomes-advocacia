from pathlib import Path

p = Path('index.html')
text = p.read_text(encoding='utf-8')

maps_url = 'https://www.google.com/maps/search/?api=1&query=Rua+Paulo+Set%C3%BAbal%2C+302%2C+Vila+Angeli%2C+Valinhos+-+SP'
google_url = 'https://www.google.com/search?q=C%C3%ADntia+Almeida+Gomes+Advocacia+Valinhos'

old_contact = '''<strong>WhatsApp:</strong> (19) 99683-7596<br>
<strong>E-mail:</strong> cintiapalmeida@adv.oabsp.org.br<br>
<strong>Atendimento presencial:</strong> Valinhos/SP e região de Campinas<br>
<strong>Atendimento online:</strong> todo o Brasil<br>
<strong>Horário noturno:</strong> mediante disponibilidade, até 21h</p>
<div class="social">
<a class="js-wa" href="https://wa.me/5519996837596?text=Ol%C3%A1%2C%20Dra.%20C%C3%ADntia.%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20atendimento%20jur%C3%ADdico." target="_blank" rel="noopener noreferrer">WhatsApp</a>
<a href="mailto:cintiapalmeida@adv.oabsp.org.br">E-mail</a>
<a href="https://www.instagram.com/cintiap.almeida?utm_source=qr&amp;igsh=bW0zMzU2emk2azdz" target="_blank" rel="noopener noreferrer">Instagram</a>
<a href="https://www.linkedin.com/in/cintia-almeida-gomes-768b401a3" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>'''

new_contact = f'''<strong>WhatsApp:</strong> (19) 99683-7596<br>
<strong>E-mail:</strong> cintiapalmeida@adv.oabsp.org.br<br>
<strong>Endereço:</strong> Rua Paulo Setúbal, 302 · Sala 03 – Espaço Lacarzi · Vila Angeli · Valinhos/SP<br>
<strong>Atendimento presencial:</strong> Valinhos/SP e região de Campinas<br>
<strong>Atendimento online:</strong> todo o Brasil<br>
<strong>Horário noturno:</strong> mediante disponibilidade, até 21h</p>
<div class="social">
<a class="js-wa" href="https://wa.me/5519996837596?text=Ol%C3%A1%2C%20Dra.%20C%C3%ADntia.%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20atendimento%20jur%C3%ADdico." target="_blank" rel="noopener noreferrer">WhatsApp</a>
<a href="mailto:cintiapalmeida@adv.oabsp.org.br">E-mail</a>
<a href="{maps_url}" target="_blank" rel="noopener noreferrer">Como chegar</a>
<a href="{google_url}" target="_blank" rel="noopener noreferrer">Ver no Google</a>
<a href="https://www.instagram.com/cintiap.almeida?utm_source=qr&amp;igsh=bW0zMzU2emk2azdz" target="_blank" rel="noopener noreferrer">Instagram</a>
<a href="https://www.linkedin.com/in/cintia-almeida-gomes-768b401a3" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>'''

if old_contact not in text:
    raise SystemExit('Contact block not found; refusing broad edit')
text = text.replace(old_contact, new_contact, 1)

old_footer = '''Cíntia Pereira Almeida Gomes<br>Advogada · OAB/SP 541.172<br>Valinhos/SP · Região de Campinas<br>Atendimento online em todo o Brasil<br>'''
new_footer = f'''Cíntia Pereira Almeida Gomes<br>Advogada · OAB/SP 541.172<br>Rua Paulo Setúbal, 302 · Sala 03 – Espaço Lacarzi · Vila Angeli · Valinhos/SP<br><a href="{maps_url}" target="_blank" rel="noopener noreferrer">Como chegar no Google Maps</a><br>Atendimento online em todo o Brasil<br>'''
if old_footer not in text:
    raise SystemExit('Footer block not found; refusing broad edit')
text = text.replace(old_footer, new_footer, 1)

schema_marker = '<link rel="icon" href="assetslogo-cintia-oficial.png" type="image/png">'
schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "@id": "https://cintiaalmeidaadvocacia.com.br/#escritorio",
  "name": "Cíntia Almeida Gomes Advocacia",
  "url": "https://cintiaalmeidaadvocacia.com.br/",
  "telephone": "+5519996837596",
  "email": "cintiapalmeida@adv.oabsp.org.br",
  "address": {{
    "@type": "PostalAddress",
    "streetAddress": "Rua Paulo Setúbal, 302, Sala 03 – Espaço Lacarzi",
    "addressLocality": "Valinhos",
    "addressRegion": "SP",
    "addressCountry": "BR"
  }},
  "hasMap": "{maps_url}",
  "areaServed": ["Valinhos", "Campinas", "Brasil"],
  "sameAs": [
    "https://www.instagram.com/cintiap.almeida",
    "https://www.linkedin.com/in/cintia-almeida-gomes-768b401a3"
  ]
}}
</script>
'''
if '"@type": "LegalService"' not in text:
    if schema_marker not in text:
        raise SystemExit('Head marker not found; refusing broad edit')
    text = text.replace(schema_marker, schema + schema_marker, 1)

p.write_text(text, encoding='utf-8')

assert 'Rua Paulo Setúbal, 302' in text
assert '>Como chegar<' in text
assert '>Ver no Google<' in text
assert '"@type": "LegalService"' in text
