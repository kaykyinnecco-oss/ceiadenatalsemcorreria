# Pendências e limites reais

## Dados que ainda precisam do responsável

1. Preencher RAZAO_SOCIAL e CNPJ em config.js. O rodapé omite esses campos enquanto estiverem vazios.
2. Confirmar o canal de entrega na configuração deste produto na Cakto e preencher ENTREGA_CONFIRMADA. Hoje o FAQ informa apenas liberação após a confirmação do pagamento, sem prometer um canal específico.
3. Fornecer/revisar as páginas legais definitivas e configurar PRIVACIDADE_URL e TERMOS_URL. Há diálogos informativos básicos como fallback.
4. Incluir no PDF a orientação: “Multiplique a quantidade por pessoa. Forno, panelas e temperos pedem ajuste.” O repositório não traz o PDF completo nem uma amostra que comprove essa instrução. A opção “13 ou mais” exibe somente a mensagem, sem quantidades. O FAQ usa uma resposta conservadora até ORIENTACAO_13_CONFIRMADA ser validada.
5. Confirmar as bandeiras de cartão deste checkout. A tela pública confirma Pix, cartão de crédito, PicPay e Google Pay, mas não lista as bandeiras. PAYMENT_BRANDS mantém apenas Pix até confirmação. As quatro artes oficiais e suas regras estão em assets/pagamentos/FONTES.md.
6. Os anexos 1, 2, 4, 5 e 6 da rodada atual precisam de tarja nos sobrenomes antes de qualquer publicação. Somente o anexo 3, com prenome e inicial, está na pasta de depoimentos. Nenhuma mensagem foi reescrita, cortada ou editada.

## Conferido nesta revisão

- Novo pixel 902695826167879 substitui o ID antigo. Eventos e UTMs testados, sem envio real ao Meta durante QA.
- Apenas o terceiro anexo da rodada atual foi aprovado para publicação. Os outros cinco mostram sobrenomes completos e aguardam tarja. Todos os três arquivos de feedback da versão anterior foram removidos.
- Tabela real: 4, 6, 8, 10 e 12 pessoas. As opções 5, 7, 9 e 11 usam cálculo proporcional identificado no site, derivado das mesmas proporções. As listas prontas do PDF são para 6 e 10.
- Os formulários do PDF não calculam automaticamente. A demonstração do site calcula os três exemplos, sem prometer automação dentro do arquivo.
- As páginas reais dos mockups foram preservadas, inclusive suas referências de quantidade. Não há “4 a 12 pessoas” nos chips ou na copy principal.
- O exemplo do PDF serve às 21h; o relógio comercial aponta 24/12/2026 às 20h, como no projeto original. Após esse horário, acompanha o Réveillon.
- Kit com 51 páginas e 14 receitas; bônus com 11 e 13 páginas, conforme documentação original. Os arquivos pagos completos não fazem parte do repositório.
- Metas locais de desempenho atingidas: Lighthouse mobile 98, LCP 2,48 s, CLS 0, TBT 10 ms. Medição por HTTP/gzip; detalhes e limitações em VERIFICACAO.md.
- 11 testes do relógio, 10 grupos funcionais e 8 verificações adicionais de conversão passaram. Prints nos seis tamanhos e em cinco datas.

O envio à main foi autorizado no pedido desta revisão. Não há nova aprovação pendente para o push. A confirmação do deploy é registrada na entrega; os dados de negócio acima continuam pendentes após a publicação.
