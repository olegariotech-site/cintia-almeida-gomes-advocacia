# Cíntia V5.1 — Política de Privacidade e Cookies: revisão para aprovação

**Status:** RASCUNHO. Não publicar antes da validação pela Cíntia.  
**Base:** V5 publicada em `1ad8d6b49e0c7bbfa73853fa06980775a39582f9`.  
**Origem:** adaptação do PR histórico #12, que estava desatualizado e continha um WhatsApp antigo. **Não realizar merge do PR #12.**

## Mudanças propostas

- Criado `privacidade.html` autocontido e responsivo, com identidade visual espresso/marfim/dourado, fontes locais e sem novas bibliotecas de JS/trackers.
- Link no rodapé, no aviso de cookies e nas duas mensagens de ajuda do formulário (com e sem JavaScript).
- Conteúdo da homepage, SEO, título, OAB, telefone oficial, destino do formulário, scripts GTM e vídeo preservados.
- A comparação de integridade V4/V5 permite exclusivamente quatro alterações de texto com marcação exata, sem relaxar as verificações restantes.
- Política descreve o comportamento atual de formulário somente no navegador, WhatsApp, hospedagem por GitHub Pages e armazenamento local da escolha de cookies.

## Confirmações recebidas da direção OT — 12/11/2026

- **Nome profissional:** Cíntia Pereira Almeida Gomes, com um único L em Almeida. Confirmado.
- **Canal LGPD:** `cintiapalmeida@adv.oabsp.org.br` é o e-mail oficial e está autorizado para solicitações relacionadas à LGPD. Confirmado.
- **Canais de atendimento e histórico de conversas:** WhatsApp e e-mail; não foi informado uso de CRM, sistema jurídico ou outro repositório dedicado para guardar conversas. Confirmado pela direção OT. **Não equivale à confirmação da política de retenção de cada conta.**
- **Backup automático do WhatsApp:** ativado, conforme resposta afirmativa da direção OT. **Não foi identificado se a cópia usa Google Drive ou iCloud**, nem confirmadas a criptografia e a retenção.
- **Texto correspondente ajustado** na seção 4 da política, incluindo o backup automático confirmado sem pressupor o fornecedor.

## Pontos que exigem confirmação profissional antes da publicação

1. **Retenção:** confirmar a prática interna de conservação/exclusão das mensagens no WhatsApp/e-mail e por quanto tempo as cópias automáticas são mantidas. Não presumir prazos nem exclusão definitiva.
2. **Fornecedores de infraestrutura:** identificar prestador do e-mail e onde está configurado o backup automático do WhatsApp (Google Drive ou iCloud), inclusive eventual proteção por criptografia. Não há CRM ou sistema jurídico adicional informado para histórico de conversas.
3. **Medição:** inspecionar o contêiner `GTM-TGGPH6PH` e identificar se GA4 e/ou Meta Pixel foram de fato publicados; inventariar categorias de cookies, duração e fornecedores. **Não afirmar Pixel/GA4 ativos sem evidência.**
4. **Bases legais e transferências:** validar hipóteses aplicáveis a cada operação e eventual transferência internacional conforme contratos dos serviços.
5. **Contato sensível:** validar orientação ao visitante para evitar o envio de documentos completos e dados sensíveis no formulário de primeiro contato.
6. **Aprovação jurídica:** a Cíntia deve revisar e aprovar o conteúdo da página e a data antes do merge.

## Checklist QA

- [ ] Link do rodapé abre `/privacidade.html` em mobile e desktop.
- [ ] Link no aviso de cookies abre a política sem enviar dados/aceitar cookies automaticamente.
- [ ] Formulário com JS e fallback sem JS mantêm destinos WhatsApp oficiais (19) 97143-2465.
- [ ] Política não carrega GTM nem qualquer Pixel por conta própria.
- [ ] Primeira visita: consentimento opcional não carrega GTM antes da aceitação.
- [ ] Recusa mantém site funcional; reabertura do consentimento funciona.
- [ ] Revogação após aceite impede novas medições a partir do reload.
- [ ] Página legível com teclado, leitor de tela, 320px, 390px e 200% de zoom.
- [ ] `robots.txt`, `sitemap.xml`, `CNAME`, vídeo e CSS do site oficial não foram alterados.
- [ ] Testes automáticos em PR sem falhas atribuíveis à atualização.
- [ ] Aprovação expressa da direção OT + Cíntia antes da publicação.

**Nota:** O aviso de privacidade do website não substitui governança interna LGPD nem termos/registro de tratamento de dados relativos aos clientes do escritório. Conteúdo para revisão jurídica pela responsável.

## Base regulatória consultada

- Lei nº 13.709/2018 (LGPD), especialmente transparência e direitos do titular.
- Guia de Cookies e Proteção de Dados Pessoais da ANPD.
- Resolução CD/ANPD nº 2/2022, sobre agentes de tratamento de pequeno porte.

Links oficiais:
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais
- https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022
- https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares
