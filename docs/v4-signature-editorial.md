# Cíntia Advocacia V4 — Signature Editorial

Status: **prévia de implementação na branch isolada** `feat/cintia-v4-signature-editorial`. Não publicar automaticamente.

## Direção aprovada

Uma linguagem unificada, sem copiar marcas externas:
- **Legora / editorial:** canvas marfim, tipografia serifada de exibição, conteúdo jurídico organizado e separadores de 1px.
- **Abetterlou / cinematográfico:** HERO espresso + creme, fotografia profissional em destaque, dourado reservado a ações e assinaturas.
- **Halfhelix / precisão:** navegação discreta, quase nenhum efeito de elevação, linhas finas e interação contida.

**Referência de execução:** V3 existente (HTML/CSS/JS), acrescida de `v4.css`. O corpo recebe `class="v4"`, permitindo retirar a camada V4 sem alterar o CSS legado. A fonte display continua Cormorant Garamond; texto e interface, Inter. Não incorporar arquivos de fontes comerciais.

## Decisões e limites

1. Preservar a identidade original da Cíntia, logotipo, fotografias, campos e textos de conteúdo jurídico.
2. HERO reestruturado apenas no título: "Advocacia estratégica e humanizada" e o trecho que o acompanhava passa a uma linha de apoio. Manter o vídeo/poster da assinatura com menor protagonismo.
3. Áreas jurídicas e FAQ permanecem `details/summary` nativos, com conteúdo intacto.
4. O formulário mantém validação nativa e abre WhatsApp com resumo estruturado; fallback direto mantém-se disponível se o JS não funcionar.
5. Telefone oficial em todo o código: **+55 19 97143-2465**, destino `https://wa.me/5519971432465`.
6. Nenhuma mudança em metadados de atuação, OAB, endereço, publicação, hospedagem ou serviços jurídicos.
7. A V4 usa CSS estático sobre a estrutura atual; nenhuma nova dependência, framework ou API.

## Gate de QA (a executar antes da publicação)

### Desktop e responsividade

- [ ] Chromium/Edge a 1440×900 e 1366×768: contraste, cortes de HERO, fotografia, assinatura, navegação e ausência de rolagem horizontal.
- [ ] Tablet 768×1024 e notebook 1024×768: colunas e menu de navegação.
- [ ] Android (Chrome) a 390×844 e largura mínima 320px: CTA, rolagem, cards, áreas/FAQ.
- [ ] iPhone Safari físico: vídeo ou poster de fallback, fotografia, menu, WhatsApp, campos do formulário e teclado virtual.
- [ ] Landscape 844×390: menu e ausência de sobreposição.

### Função e acessibilidade

- [ ] Em `#contato`, formulário com campos vazios não deve enviar; com dados válidos deve abrir `wa.me/5519971432465` com mensagem composta corretamente.
- [ ] Se popup do WhatsApp for bloqueado, link de fallback deve abrir mensagem preparada.
- [ ] Botão flutuante WhatsApp deve usar o novo número e ocultar-se durante a digitação quando aplicável.
- [ ] Navegação por teclado / foco visível, menu expandido e fechado, accordion com Enter/Espaço.
- [ ] `prefers-reduced-motion`: sem animações necessárias à leitura; a página permanece íntegra sem JS.
- [ ] Consentimento de cookies: Aceitar / Recusar / preferências.
- [ ] Página 404 e SEO/OG/JSON-LD continuam corretos.
- [ ] Comparar Lighthouse/LCP/CLS/INP e peso total entre a V3 em produção e a V4 no mesmo dispositivo.

**Gate de publicação:** aprovação visual e testes físicos concluídos; só então autorizar merge na `main` e confirmar propagação na URL oficial. Não declarar homologação antes da evidência real.
