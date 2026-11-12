# Cíntia V5 — Signature Experience

Candidata isolada em `feat/cintia-v5-signature-experience`. Base V4 publicada confirmada em `8ff0e64088696e6c7b815c10282d3fc1b8b41cd1`, incluindo o PR #16. Sem merge/deploy/DNS/custos autorizados.

## Contrato de direção

A base visual é a própria V4 aprovada: espresso/marfim/dourado, Cormorant Garamond/Inter, texto à esquerda e fotografia real à direita. A referência Kirkland fornecida pela direção orienta apenas a coordenação entre mídia, respiro e movimento; nenhum código, imagem, componente, fonte proprietária ou animação externa foi copiado. Padrões: HERO claro, confiança editorial, etapas de atendimento e atmosfera secundária.

| Decisão | Origem e função | Limite |
|---|---|---|
| Foto com enquadramento que se acomoda e filete dourado | Missão V5, continuidade e identidade | 620 ms desktop/420 ms mobile; transform, sem ocultar a foto ou o CTA |
| Três pilares em sequência | Mensagens já aprovadas, hierarquia de leitura | 440 ms + 80/160 ms de sequência; mobile 300 ms + 40/80 ms; opacidade inicial legível |
| Separadores nas áreas | Precisão editorial e orientação | Efeito decorativo; acordeões nativos e conteúdo estável |
| Linha das etapas | Processo existente, continuidade de leitura | CSS view timeline progressiva; linha estática em mobile/motores incompatíveis; rolagem nativa |
| Área → formulário | Solicitação funcional expressa | Somente clique/Enter no link; não abrir WhatsApp nem apagar campos preenchidos |
| Contato sem JavaScript | Requisito funcional expresso | Campo nativo de mensagem via GET para o mesmo número; sem backend/armazenamento |
| Fotos responsivas e fontes locais | Investigar peso/discoberta no carregamento | Mesmas fotografias/famílias, originais e licenças preservados; medir antes/depois |

O recorte oblíquo é avaliado apenas em capturas de ensaio. Só será adotado se a inspeção mostrar vantagem; a candidata começa com a borda reta aprovada. FAQ/contato não recebem entrada animada. Nenhuma animação de bloqueio, dependência de runtime, novo vídeo ou efeito 3D.

## Conteúdo, mídia e confiança

Os textos jurídicos, nome/OAB, destinos existentes, metadados, dados estruturados, domínio/sitemap/robots e MP4/poster originais são comparados automaticamente com a base. O controlador corrigido de vídeo é preservado integralmente. Fotos derivadas mantêm a proporção original e são redimensionadas com Lanczos/WebP qualidade 90, sem retoques. PNG/JPEG originais seguem disponíveis como fallback. [Proveniência dos derivados e fontes](qa-v5/asset-provenance.json).

As fontes WOFF2 Latin são servidas localmente, byte a byte como fornecidas pelo Google Fonts, com as licenças OFL versionadas. Os pesos seguem os existentes; a mudança não é uma troca de tipografia.

## Contrato de funcionamento

Fluxo: abrir → ler HERO imediatamente → consultar área → acionar explicitamente atendimento naquela área → formulário mantém os dados e seleciona o assunto → validação e composição do WhatsApp oficial. Abrir acordeões não seleciona nem envia nada. Com JS indisponível, o mesmo formulário oferece um campo nativo de mensagem e a opção de contato direto.

Movimento reduzido mantém conteúdo/contato e poster estáticos, sem buscar o MP4. Sem suporte a view timeline, as quatro etapas e sua linha continuam presentes. Um observer já existente é compartilhado pelas entradas finitas; o controlador do vídeo não foi reescrito. As animações de entrada dos blocos de leitura partem de opacidade legível e não atrasam informações essenciais.

## Validação e cobertura

- Chromium/WebKit: 1920×1080, 1366×768, 1280×720, 1024×768, 768×1024, 390×844, 375×812, 320×740 e 844×390.
- Primeira dobra, imagens/legenda, assinatura, erros de runtime/rede, fontes e ausência de overflow.
- Seleção contextual por teclado/clique, dados preservados, envio interceptado, no-JS nativo, movimento reduzido e reflow equivalente a 200%.
- Gravações reais em desktop/mobile; eventos das animações confirmam sua execução.
- Suítes anteriores de menu, formulário, foco, vídeo/fallback, cookies, 404 e axe, preservadas.
- Lighthouse: V4 publicada × V5 no mesmo runner, três medições frias alternadas por versão, mesmo throttling, LCP/CLS/TBT/FCP/transferência. Sem garantia de atingir 2,5 s e sem medição de campo.

Ambiente local com Chromium bloqueado por `socket() failed: Operation not permitted`; Browser plugin indisponível. A validação renderizada usa GitHub Actions/Playwright, com capturas inspecionadas antes do parecer. Aparelhos físicos e leitores de tela reais não estão disponíveis nesta sessão. Resultados, evidências, decisão do recorte e parecer GO/NO-GO estão no [parecer final da V5](v5-parecer-final.md). Os 47 cenários V5 e os quatro gates de desempenho passaram, inclusive na confirmação #43311734719. GO técnico com ressalva de LCP; NO-GO para publicação até homologação física e autorização expressa OT. A borda reta foi mantida após comparar o ensaio oblíquo.
