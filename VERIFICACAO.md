# Verificação da revisão pontual de marcas e feedbacks

Rodada atual: Lighthouse mobile **98**, acessibilidade **100**, boas práticas **100**, SEO **100**; LCP **2,48 s**, CLS **0**, TBT **10 ms**, por HTTP/gzip no mesmo ambiente de QA.

11 testes do relógio, 10 grupos funcionais e 8 verificações adicionais de conversão passaram. Playwright em 360×740, 390×844 e 1440×900: sete benefícios com miniaturas reais, um feedback apto, nenhum erro de página, nenhuma imagem visível quebrada e nenhuma rolagem horizontal. A fixture de quatro marcas confirmou a linha única e a carga das quatro imagens em todos os tamanhos; ela não confirma aceitação de bandeiras no checkout. Os prints de componentes ocultam a faixa fixa somente na captura para não sobrepor o componente fotografado.

As pílulas de texto foram substituídas por imagens oficiais nos conjuntos do plano e da garantia. Apenas Pix está habilitado até confirmação das bandeiras de cartão. Razão social e CNPJ continuam pendentes de fornecimento; não foram inventados. As variáveis estão no topo de config.js e o rodapé já as renderiza quando preenchidas.

As cinco imagens de depoimento com sobrenome completo não foram publicadas. O arquivo aprovado preserva a resolução original e o conteúdo integral. A árvore atual foi varrida quanto a referências antigas; arquivos removidos e adicionados são apresentados no relatório de entrega. O histórico Git é preservado, conforme a exigência de não usar force push.

## Registro da revisão anterior

## Método

Mesmo computador, Chrome headless e Lighthouse 12.8.2 com simulação mobile padrão. Servidor HTTP serve 14.2.4 em localhost:8765 com gzip confirmado no cabeçalho Content-Encoding. Sem eventos enviados ao pixel real e sem abrir compras durante os testes. Medições de laboratório, não dados de usuários em produção.

## Desempenho antes e depois

| Métrica | Referência do projeto anterior | Antes neste computador | Depois neste computador |
| --- | ---: | ---: | ---: |
| Lighthouse mobile | 84 | 96 | 98 |
| LCP | 2,60 s | 2,71 s | 2,40 s |
| CLS | 0 | 0 | 0 |
| TBT | 440 ms | 16 ms | 6 ms |

Os valores de 84/2,6 s vieram da documentação original e de outro ambiente. A comparação direta usa as colunas medidas neste computador. A rodada final também obteve 100 em acessibilidade, boas práticas e SEO. Metas de performance ≥90 e LCP ≤2,5 s atingidas nesta medição.

Otimizações: hero WebP responsivo 480/768/1200, com 46.324/86.000/116.686 bytes; preload e fetchpriority high na capa; dimensões reservadas; fontes WOFF2 locais; CSS crítico inline e restante não bloqueante; scripts defer; Meta e pop-up após a primeira pintura; lazy/async abaixo da primeira tela; imagens de páginas e bônus abaixo de 80 KB. A capa do cartão usa o arquivo de 46 KB. O hero nunca fica oculto esperando JavaScript.

## Testes

- 11 testes do relógio passaram, preservando cálculo por Date.now, quatro unidades, datas de transição, HEAD inválido, file:// e reduced motion.
- 10 grupos funcionais passaram: cinco abas com naturalWidth > 0, quantidades originais, FAQ, cinco datas, eventos/UTMs, ID vazio, um print autorizado, ampliação, autoavanço/pausa, saída desktop/mobile e fechamento fora.
- 8 testes adicionais passaram: seletor completo com origem dos valores, mensagem para 13+, variante B em 360/390/1280, atraso de 12 s, perguntas expansíveis, foco contido, fechamento por gesto, persistência por sessão, bloqueio no fim e após checkout, setas com 1/2/3 prints e inicialização do novo pixel.
- O teste do pixel intercepta fbevents.js e verifica init 902695826167879, PageView, ViewContent e InitiateCheckout, sem transmitir eventos ao Meta.

## Revisão visual

Playwright por HTTP: 360×740, 390×844, 412×915, 768×1024, 1280×800 e 1440×900. Sem rolagem horizontal, textos fora do viewport, erros de página ou imagens quebradas. Conferência visual dos prints desktop, celular e pop-ups.

Em 390×844 o mockup começa em y≈353 e termina em y≈703. O título, CTA e capa inteira aparecem na primeira tela. A faixa permanece fixa, com todas as unidades.

Cinco datas simuladas: 03/11/2026 14:41, 23/12/2026 14:41, 24/12/2026 10h, 24/12/2026 21h e 02/01/2027 10h. São testadas as fases planejamento, véspera, dia da ceia, Réveillon e encerramento, sem alterar preço.

Os prints finais usam reduced motion para registrar o estado completo. Autoavanço, gesto e animações são verificados em testes separados. Os mocks mantêm as páginas reais, sem recorte do conteúdo pago. Os arquivos de relatório e imagens são entregues separadamente e não pesam no deploy.

## Limites

Não houve compra, validação do recebimento do produto nem acesso administrativo à Cakto. CNPJ, canal de entrega, textos legais, orientação para grupos maiores no PDF e SVGs oficiais de pagamento continuam listados em README-PENDENCIAS.md. As métricas locais não garantem o mesmo resultado em todo aparelho, rede ou instalação de terceiros.
