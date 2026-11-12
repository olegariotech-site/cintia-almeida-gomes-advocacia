# Cíntia V4 — hotfix do HERO

Base publicada: `aade965e7f3cce532b70fc131bc41c6b3bb21dca` (12/11/2026). Branch exclusiva: `hotfix/v4-hero-premium`. Sem autorização de merge/publicação. Backup V3 preservado.

## Direção e contrato

O alvo é a própria V4 aprovada. Público: visitante buscando atendimento jurídico; ação principal: solicitar atendimento. Padrões aplicados: HERO comercial (P01), confiança editorial (P10) e atmosfera estritamente secundária (P14).

| Decisão | Origem | Papel / motivo |
|---|---|---|
| Espresso, marfim, dourado, Cormorant Garamond e Inter | Direção OT e V4 aprovada | Preservar identidade e hierarquia |
| Texto e CTA na primeira dobra de 1366×768 e 1280×720 | Critério explícito da missão | Reduzir escala e espaços com viewport compacto, sem cortar conteúdo |
| Retrato proporcional, sem height:100% ou min-height obrigatório | Defeito observado + regras de mídia responsiva | A altura da foto não deve esticar o HERO |
| Legenda com fundo em degradê sobre a própria fotografia | Acabamento editorial solicitado | Eliminar a emenda e manter contraste, preservando rosto e foto real |
| Assinatura centralizada dentro do HERO | Missão de enquadramento | Substituir deslocamento inferior negativo por posição proporcional |
| Vídeo e poster originais; movimento reduzido respeitado | Missão e comportamento existente | Sem reprodução forçada nem geração de novas imagens |

Não foram adotados outros estilos, novas fontes, sombras decorativas ou uma nova arquitetura de página. A pesquisa externa suplementar estava indisponível; a referência vinculante é a V4 existente e a direção explícita da OT, complementadas por critérios de proporção, imagem responsiva e acessibilidade.

## Diagnóstico de mídia e integridade

- MP4 original: H.264 High, yuv420p, 1280×720, 24 fps, 8 s, 703.384 bytes. Frames extraídos em 1 s e 4 s confirmam movimento do símbolo/pena.
- CSS anterior: assinatura com bottom:-90px e opacidade 0,15; retrato com height:100%, min-height:480px e flex de crescimento. São condições de composição, não prova de bloqueio do autoplay em qualquer navegador físico.
- Autoplay, muted, playsinline, observer e tratamento de fallback serão avaliados com eventos/readyState/currentTime nos dois motores. Não atribuir falta de movimento a uma causa não reproduzida.
- A fotografia recebe width/height intrínsecos (1086×1448) e uma alternativa WebP **sem perdas**, com o PNG original como fallback nativo via picture. Os pixels RGBA decodificados foram comparados integralmente: idênticos. O derivado tem 1.633.694 bytes contra 2.438.940 bytes do PNG (−33,0%). Nenhum asset original foi alterado; sem recorte, redimensionamento ou retoque da fotografia.
- Sem mudanças de contatos, conteúdo jurídico, OAB, SEO, DNS ou configurações comerciais.

## Validação

Os testes `hotfix-hero.mjs` comparam o snapshot publicado e a branch nas resoluções exigidas, incluindo paisagem. Registram medidas dos elementos, primeira visita com cookies, screenshots, eventos de mídia, enquadramento, overflow e fallback. A suíte V4 existente revalida contato, teclado, acessibilidade e privacidade.

`hotfix-performance.mjs` compara V4 antes/depois, três execuções frias alternadas, no mesmo runner e throttling. Mede LCP/CLS/TBT e registra o candidato LCP e recursos bloqueantes. Não mede INP de campo.

O ambiente local impede inicializar Chromium (`socket() failed: Operation not permitted`); a validação renderizada ocorre em GitHub Actions, com Playwright/Chromium/WebKit. Aparelhos físicos indisponíveis nesta sessão; emulação e motor WebKit não equivalem a Safari físico.

Parecer final e evidências serão registrados após execução e inspeção visual real das capturas.
