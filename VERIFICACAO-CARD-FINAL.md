# Card, faixa e copy de convidados — 04/11/2026

Base: ba34d6ebceaee13224e7d44d128e836c292a81ce, recebida com git pull --rebase origin main. As mudanças ficam nos quatro pontos pedidos, nos metadados de altura necessários para evitar saltos de imagem e na documentação/testes correspondentes. Preço, checkout, pixel, cores, ícones, arquivos de imagens, seções e carrossel foram preservados.

## Altura aprovada pelo responsável

O card real media 984.78 px em 390 px. Seguindo os tamanhos solicitados, passou a 872.39 px. O responsável escolheu expressamente preservar as seis linhas e aceitar 872 px, substituindo a meta inicial de 800 px. Não foi agrupado nenhum benefício.

Capa: 246 → 202 px (redução de aproximadamente 18%). Capas escaladas para 82%, proporcionais, com pequenos deslocamentos no próprio conjunto para reservar o canto da faixa. Lista com mínimo de 52 px por linha, gap de 6 px, miniaturas 38×48 px, selos preservados, texto de 15 px, padding de 18 px, margens de 16 px entre título/lista/preço/botão, preço de 40 px e botão de 52 px. Garantia e pagamentos mantêm os tamanhos anteriores.

## Faixa contida

Contêiner de canto 110×110 px até 640 px, 140×140 px acima disso; canto superior esquerdo mantido. Overflow hidden no contêiner e no card, com raio herdado do card. Banda de 26 px, rotação de −45°, texto de 10 px no celular/11 px nos demais tamanhos e brilho na mesma faixa de tinta. Extensões laterais da tinta terminam no clip do canto. Tanto o getBoundingClientRect da banda quanto o do contêiner ficam dentro do card.

Além dos retângulos, o teste cruza o polígono da tinta com os polígonos transformados das capas e com o título: área de sobreposição inferior a 0,1 px² em todos os tamanhos. O desktop foi comparado com a versão anterior após decodificar as imagens: dimensões e posições relativas de capa, bônus, texto, preço, garantia e pagamentos preservadas. Não foi necessário trocar a faixa de canto.

| Tela | Altura do card | Canto | Fora do card / sobreposição |
| --- | ---: | ---: | --- |
| 360×740 | 878.89 px | 110 px | Nenhuma |
| 390×844 | 872.39 px | 110 px | Nenhuma |
| 412×915 | 872.39 px | 110 px | Nenhuma |
| 430×932 | 872.39 px | 110 px | Nenhuma |
| 768×1024 | 996.47 px | 140 px | Nenhuma |
| 1366×768 | 635.59 px | 140 px | Nenhuma |
| 1440×900 | 635.59 px | 140 px | Nenhuma |

Em 390×844, depois de rolar ao início da lista, preço e botão ficam inteiros na mesma tela. Nenhuma rolagem horizontal, imagem visível quebrada ou erro de página. Conteúdo visível em pelo menos 12 px no celular, exceto a faixa decorativa de 10 px expressamente solicitada.

## Onde a copy foi substituída

- index.html: resposta da primeira pergunta do FAQ da página.
- index.html: resposta do chip “Serve para muitos convidados?” no pop-up.
- index.html: mensagem do seletor “13 ou mais”.
- app.js: removido o override condicionado à antiga confirmação, impedindo o retorno da copy anterior.
- config.js: removida a variável obsoleta que condicionava a mensagem.
- scripts/qa-conversion.cjs: atualizada a expectativa da mensagem do seletor.
- README.md, README-PENDENCIAS.md e VERIFICACAO-ULTIMA-RODADA.md: retiradas referências que condicionavam essa copy a uma confirmação futura.

Resposta usada no FAQ e no chip: “Sim. A tabela cobre de 4 a 12 pessoas. Para mais convidados, é só multiplicar as quantidades.”

Seletor: “Multiplique as quantidades pelo número de pessoas.”

A busca em HTML, JS, CJS, JSON, Markdown e textos do projeto não encontrou as condicionantes antigas nem a chave obsoleta. Permanecem apenas usos não relacionados: restrições alimentares, o rótulo neutro “GRUPOS MAIORES” e nomes de diretórios/relatórios de ajustes. O rodapé “Quantidades são estimativas” foi preservado, assim como as páginas reais dentro dos mockups.

## Espaços entre palavras

No celular, CTAs/chips usam letter-spacing normal e word-spacing de 0,04 em; títulos usam tracking moderado de −0,02 em e word-spacing de 0,04 em. O botão compacto da faixa usa 12 px para comportar as palavras com espaços naturais em 360 px, sem alterar o ícone, as cores ou a altura de toque de 44 px. Os demais tamanhos de botão são preservados. A faixa numérica mantém sua linha única. O teste mede os espaços entre palavras na mesma linha com Range; todos ficaram acima de 1 px. Nenhum texto do botão sai de seu retângulo.

## Imagens e CLS

Os arquivos de imagem não foram alterados. Os nove atributos de altura de páginas reais passaram de 1019 para 1018 px, que é a dimensão do arquivo existente. A altura dinâmica da página não recortada nas abas acompanha esse mesmo valor. Isso reserva a proporção correta antes da decodificação; não altera a aparência final da imagem. CLS 0 na carga de todos os tamanhos e no Lighthouse.

## Desempenho e regressão

Lighthouse mobile **98**, acessibilidade **100**, boas práticas **100**, SEO **100**. **LCP 2.483 s; CLS 0; TBT 2 ms.** HTTP/gzip, Chrome headless, Lighthouse 12.8.2, simulação mobile padrão no mesmo ambiente local. Métricas de laboratório, sujeitas à variação do ambiente.

11 testes do relógio, 10 grupos funcionais e a nova suíte de card passaram. Testados: bordas/clip, nenhuma sobreposição da faixa, composição do desktop, preço/CTA na mesma tela, todos os espaços, novas respostas, seletor, pop-ups A/B com todas as respostas abertas, imagens, layout, eventos e UTMs. Testes em 360×740, 390×844, 412×915, 430×932, 768×1024, 1366×768 e 1440×900.

## Pendências mantidas

Faltam as URLs definitivas de Privacidade, Termos e Cookies e a confirmação do canal de entrega da Cakto. Não foi incluído texto jurídico nem identificação empresarial. A altura de 872 px é uma escolha aprovada, não uma pendência aberta de 800 px.

Envio autorizado à main, com pull --rebase e push normal. Produção será confirmada na entrega depois de abrir a URL pública entre um e dois minutos após o push.
