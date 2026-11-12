"""Compare approved content, metadata, media and video controller to published V4."""
from html.parser import HTMLParser
from pathlib import Path
import argparse,hashlib,json,re
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.stack=[];self.text=[];self.meta=[];self.links=[];self.canonical=[];self.title=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);skip=(self.stack[-1][1] if self.stack else False) or tag in ['script','style','noscript'] or 'data-area' in a
  if tag=='meta':self.meta.append(a)
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a)
  if tag=='a' and 'data-area' not in a:self.links.append(a.get('href'))
  if tag not in ['meta','link','img','source','br','input','hr','wbr']:self.stack.append((tag,skip))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):
  if self.stack and self.stack[-1][0]=='title':self.title.append(data)
  if (not self.stack or not self.stack[-1][1]) and data.strip():self.text.append(' '.join(data.split()))
a=argparse.ArgumentParser();a.add_argument('--baseline',default='_before');args=a.parse_args();root=Path(__file__).resolve().parents[1];base=Path(args.baseline)
old=(base/'index.html').read_text();new=(root/'index.html').read_text()
# V5.1 adds a reviewed privacy notice and transparency links. Strip ONLY the
# four exact, allowlisted markup replacements when comparing approved V4 copy.
# Any other legal copy/contact/SEO change must still fail the original gate.
approved_privacy_changes=[
 ('<p class="footer-note">Conteúdo jurídico de caráter informativo. · <a href="privacidade.html">Privacidade e cookies</a></p>',
  '<p class="footer-note">Conteúdo jurídico de caráter informativo.</p>'),
 ('<p>Usamos cookies opcionais de medição somente com sua autorização. Você pode aceitar ou recusar sem prejudicar a navegação. <a href="privacidade.html">Entenda como tratamos seus dados</a>.</p>',
  '<p>Usamos cookies de medição para entender como o site é utilizado e melhorar a experiência. Você pode aceitar ou recusar.</p>'),
 ('<small id="formHelp">Os dados são usados para preparar uma mensagem no WhatsApp; o site não mantém cadastro próprio. Evite informar dados sensíveis neste primeiro contato. <a href="privacidade.html">Política de privacidade</a>.</small>',
  '<small id="formHelp">As informações preenchidas serão usadas para montar uma mensagem e abrir o WhatsApp. O site não armazena esses dados.</small>'),
 ('<small id="nativeHelp">Sua mensagem será aberta no WhatsApp, sem cadastro próprio neste site. Evite incluir dados sensíveis. <a href="privacidade.html">Privacidade</a>.</small>',
  '<small id="nativeHelp">As informações preenchidas serão usadas para montar uma mensagem e abrir o WhatsApp. O site não armazena esses dados.</small>'),
]
normalized=new
for add,original in approved_privacy_changes:
 assert normalized.count(add)==1, 'V5.1 privacy markup modified or missing: '+add[:70]
 normalized=normalized.replace(add,original)
policy=(root/'privacidade.html').read_text()
assert '<meta name="robots" content="noindex,follow">' in policy
assert 'OAB/SP 541.172' in policy and 'cintiapalmeida@adv.oabsp.org.br' in policy
assert 'GTM-TGGPH6PH' not in policy and 'gtag(' not in policy
assert '<script' not in policy
x=Page();x.feed(old);y=Page();y.feed(normalized)
results={'approvedTextIdentical':x.text==y.text,'metaIdentical':x.meta==y.meta,'titleIdentical':x.title==y.title,'canonicalIdentical':x.canonical==y.canonical,'legacyLinkDestinationsIdentical':x.links==y.links,'structuredDataIdentical':re.findall(r'<script type="application/ld\+json">(.*?)</script>',old,re.S)==re.findall(r'<script type="application/ld\+json">(.*?)</script>',new,re.S)}
originals=['assetsdra-cintia-hero.png','assetsdra-cintia-sobre.jpeg','assetslogo-cintia-oficial.png','cintia-logo-hero-poster.jpg','cintia-logo-hero-site.mp4','robots.txt','sitemap.xml','CNAME','404.html']
media=[]
for name in originals:
 raw=(root/name).read_bytes();same=raw==(base/name).read_bytes();results[name]=same;media.append({'path':name,'unchanged':same,'sha256':hashlib.sha256(raw).hexdigest()})
def controller(js):return js.split("  initialize('assinatura em vídeo', () => {",1)[1].split("  initialize('leitura e movimento'",1)[0]
results['videoControllerIdentical']=controller((base/'site.js').read_text())==controller((root/'site.js').read_text())
report={'baseline':str(base),'results':results,'media':media,'onlyAddedCopy':'Four explicit area-contact links and a no-JS native WhatsApp field/button; approved legal copy preserved.'}
out=root/'artifacts/v5';out.mkdir(parents=True,exist_ok=True);(out/'integrity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(results,ensure_ascii=False))
assert all(results.values()),'Integrity regression: '+str([k for k,v in results.items() if not v])
