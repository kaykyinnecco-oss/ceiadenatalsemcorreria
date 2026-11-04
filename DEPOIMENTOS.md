# Prints fornecidos e autorizados

O pedido desta rodada autorizou explicitamente a publicação dos cinco prints com nomes e sobrenomes. Nenhum telefone ou e-mail foi identificado nas imagens. Não houve recorte, reescrita ou inclusão de mensagens; apenas redimensionamento proporcional e conversão WebP.

| Ordem | Anexo original | Nome do arquivo | Bytes da miniatura | Qualidade da miniatura |
| --- | --- | --- | ---: | ---: |
| 1 | Conversa no WhatsApp com Ricardo Nunes.png | feedback-01.webp | 21318 | 85 |
| 2 | Depoimento de Natal no WhatsApp.png | feedback-02.webp | 24332 | 80 |
| 3 | Conversa no WhatsApp com Roberto Silva.png | feedback-03.webp | 19114 | 85 |
| 4 | Depoimento sobre a ceia de Natal.png | feedback-04.webp | 24758 | 42 |
| 5 | Depoimento sobre uma ceia inesquecível.png | feedback-05.webp | 24724 | 55 |

./depoimentos contém exatamente cinco arquivos: as miniaturas 320×640. ./assets/feedbacks contém as cinco ampliações 900×1800, qualidade 85, e o manifesto técnico. Os nomes neutros dos arquivos evitam nomes pessoais no alt text, que é sempre “Conversa de WhatsApp com feedback de cliente”.

O responsável escolheu priorizar o limite de 25 KB e autorizou reduzir a qualidade só das miniaturas. Todas ficaram abaixo de 25.000 bytes. As ampliações mantêm qualidade 85. Cada miniatura corresponde a um único anexo e aparece uma única vez no DOM. Não há clones visuais. O lightbox navega somente pelos cinco originais e só carrega a ampliação ao ser aberto.

## Auditoria da última rodada

Cinco arquivos antes, zero duplicatas e cinco mantidos. Comparação por SHA-256 e dHash de 9×8 em escala de cinza, com distância de Hamming ≤5. A menor distância entre pares foi 14. Portanto nenhum arquivo foi apagado com git rm. A repetição estava nos conjuntos clonados do antigo marquee, removidos do código. Reproduza com node scripts/audit-feedbacks.cjs.
