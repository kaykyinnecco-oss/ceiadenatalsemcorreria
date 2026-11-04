# Verificação do marquee — 04/11/2026

Escopo: feedbacks logo abaixo do card do plano, cinco anexos na ordem deste envio, miniaturas e ampliações, lightbox, animação e navegação dependente da posição. Pull --rebase executado antes de começar.

## Testes Playwright em HTTP

| Largura | Altura da seção | Cartão | Originais únicos | CLS da seção |
| --- | ---: | --- | ---: | ---: |
| 360 px | 440 px | 119×238 | 5 | 0 |
| 390 px | 440 px | 119×238 | 5 | 0 |
| 1440 px | 520 px | 138×276 | 5 | 0 |

- Cinco cartões únicos = cinco arquivos em ./depoimentos. Ordem conferida pelos src das miniaturas. Nenhuma legenda ou frase adicional.
- Loop CSS linear a 35 px/s: a trilha mede 1965 px no celular e 4500 px no desktop. Há grupos repetidos suficientes para ultrapassar2× a tela e permitir arrasto em ambos os sentidos.
- Os testes pausam e avançam o relógio da animação exatamente um ciclo. Os PNGs das fases equivalentes são idênticos byte a byte nos três tamanhos. Não há emenda.
- Pausa em hover e toque/segurar por 3,4 s confirmada. Arrasto nativo e retomada após 3 s de inatividade confirmados.
- Lightbox usa a versão de 900 px; navegação por setas/botões, X, Esc, clique fora e retorno de foco ao cartão original passaram. O loop permanece pausado durante a ampliação.
- Reduced motion remove a animação e mantém scroll nativo. Cenários com 0, 1, 2 e 3 prints: seção omitida ou estática, sem clones/setas externas. Com zero, FAQ é o próximo elemento após #plano.
- Sem rolagem horizontal da página, imagens quebradas ou erros JS. Miniaturas com width/height, lazy e async. CLS na seção igual a 0.
- CTA novo usa o checkout e o InitiateCheckout existentes. PageView e ViewContent testados sem tráfego real ao Meta. Âncoras da faixa e do botão “Ver meu plano”, ViewContent ao alcançar #plano e pop-up de saída passaram em 390/1440 px depois da reordenação.

## Decisões para restrições incompatíveis

Nome e sobrenome foram autorizados expressamente nesta rodada, substituindo a regra anterior para esses dados. Os cinco anexos não mostram telefone nem e-mail.

Os cartões de150×300/190×380, somados ao padding48/64, título e CTA, excederiam os tetos440/520. Foram priorizados os tetos: cartões119×238/138×276, sem cortar mensagens, gap12 e padding48/64.

Três imagens excediam25KB na exportação320px/qualidade 85. O responsável escolheu reduzir apenas a qualidade das miniaturas para manter até 25 KB; as versões900px continuam com qualidade 85. Os valores por arquivo estão em DEPOIMENTOS.md e assets/feedbacks/manifest.json.

Prints e JSONs em prints/marquee, ignorados no Git. As métricas Lighthouse anteriores não são apresentadas como nova medição desta rodada. A produção e o commit são conferidos depois do push e registrados na entrega.
