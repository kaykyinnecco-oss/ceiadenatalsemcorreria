# Verificação da revisão

Revisão visual e funcional disponível para aprovação. Nenhum commit ou push foi feito.

## Conferência visual

Playwright em HTTP com `npx serve@14.2.4`: 360×740, 390×844, 412×915, 768×1024, 1280×800 e 1440×900.

- Seis viewports sem rolagem horizontal, textos cortados, sobreposição detectada ou imagens quebradas.
- Em 390×844, o mockup começa em y=398 e termina em y=748: título, CTA e mockup cabem na primeira tela.
- Cinco datas simuladas com prints: 03/11/2026 14:41, 23/12/2026 14:41, 24/12/2026 10h, 24/12/2026 21h e 02/01/2027 10h.
- Prints adicionais do seletor de quantidades, feedback ampliável e pop-up mobile/desktop.
- Os prints estáticos usam reduced motion para registrar o conteúdo final. Animações e carrossel foram testados separadamente.

## Testes

- 11 testes unitários do relógio passaram. Incluem Date.now em cada cálculo, HEAD inválido, file://, primeira renderização e segundos com reduced motion.
- 10 grupos funcionais Playwright passaram: abas e imagens, quantidades reais, FAQ, cinco fases/data, pixel/UTMs, pixel vazio, feedback/lightbox, carrossel e saída mobile/desktop.
- PageView independente de aceite, ViewContent somente no plano e InitiateCheckout nos três links de checkout. O checkout e o pixel reais não receberam tráfego de QA.
- 22 arquivos referenciados; zero arquivos ou símbolos SVG faltantes. Lista em ARQUIVOS-REFERENCIADOS.md.
- Um único print real de feedback. A prova com três itens usa uma fixture isolada no navegador de teste; nenhum relato foi adicionado à página.

## Desempenho: pendência explícita

Lighthouse mobile, configuração de throttling padrão, em Chrome headless por HTTP local:

| Métrica | Resultado |
|---|---:|
| Desempenho | 84/100 |
| Acessibilidade | 100/100 |
| Boas práticas | 100/100 |
| SEO | 100/100 |
| LCP | 2.6 s |
| TBT | 440 ms |
| CLS | 0 |

As metas de desempenho ≥90 e LCP <2,5 s ainda não foram confirmadas. O próprio Lighthouse avisou que a CPU do ambiente estava mais lenta que a esperada. Houve pressão de memória durante as medições; isso limita a comparação, sem comprovar que seja a única causa. A entrega não declara essas metas como aprovadas.

Otimizações aplicadas: capa responsiva menor no hero, preload da imagem LCP correta, remoção de leitura de scroll no startup, menos escritas no DOM e inicialização das interações após a primeira pintura. CSS/JS sem dependências; fontes locais; imagens com dimensões e lazy-load abaixo da primeira tela. Relatório completo em prints/revisao/lighthouse-mobile.report.html.

## Conteúdo e publicação

Os PDFs finais têm lista de compras, “Ceia em 3 dias” e plano do dia 24 hora a hora. As listas prontas cobrem 6 e 10 pessoas; a amostra de quantidades usa as cinco colunas reais: 4, 6, 8, 10 e 12.

Faltam razão social/CNPJ, URLs legais definitivas e confirmação do canal de entrega da Cakto. Leia README-PENDENCIAS.md.

O pacote de projeto contém código, fontes licenciadas, capas, amostras e o feedback fornecido. Não contém PDFs pagos, originais, credenciais ou links de entrega do produto.

O envio ao GitHub depende da aprovação dos prints solicitada pelo responsável. ARQUIVOS-PARA-ENVIO.md é a relação preparada; nenhum desses arquivos foi enviado nesta revisão.
