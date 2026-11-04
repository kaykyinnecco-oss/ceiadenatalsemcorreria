# Fontes oficiais das marcas de pagamento

Consulta: 03/11/2026. Os arquivos são exibidos como imagens, com proporção preservada, sem filtros, recoloração, recorte, redesenho ou efeitos aplicados à marca. As bordas e os fundos brancos pertencem aos azulejos do site. A regra de Git desta pasta preserva os bytes dos SVGs, inclusive as quebras de linha dos arquivos oficiais.

## Pix — pix-completo.svg

- Página oficial: [Área dos participantes do Pix / Marca](https://www.bcb.gov.br/estabilidadefinanceira/pix-participantes).
- Pacote original: [ArquivosdaMarcaPix.zip, Banco Central do Brasil](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/marca/ArquivosdaMarcaPix.zip).
- Arte oficial completa para aplicações digitais: `ArquivosdaMarcaPix/pdf/marca_pix_policromia_positiva_sem_mensagem.pdf` (símbolo + logotipo, sem a mensagem adicional).
- [Manual de Uso da Marca Pix, versão 1.6](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/I_manual_uso_marca_pix.pdf), páginas 6–10 e 19. A assinatura símbolo + logotipo é prevista para meios digitais. O mínimo é 145 px de comprimento da arte; preservar a área de proteção, as proporções e as cores.
- O SVG é uma exportação vetorial da página inteira do PDF oficial com PyMuPDF 1.26.6. Nenhum traçado, cor ou proporção foi editado; sem recorte nem redesenho. O respiro original foi mantido.
- Na última rodada, os quatro arquivos continuam na mesma linha, sem alterações nos bytes. Todos os azulejos têm 34 px de altura no plano e na garantia. O tamanho de exibição compensa o respiro interno de cada arquivo: aproximadamente 20 px de arte visível, inclusive no símbolo e nome Pix. Sem filtro, recoloração ou opacidade artificial; o cinza do nome faz parte do original. A escala compacta é a solicitada pelo responsável, substituindo a aplicação anterior de 145 px; não se afirma atendimento àquele mínimo nesta disposição.

## Visa — visa.svg

- [Brand Center público da Visa](https://brand.visa.com/public), redirecionado para [Assets / Logos](https://brand.visa.com/d/jRrXyxW9FN93/logos).
- Arte original publicada nessa página: [SVG oficial da Visa](https://media.ffycdn.net/us/visa/Y3RwodJGCwUU6QuYD1f9.svg). Copiado integralmente. Esse SVG oficial incorpora a imagem PNG que a própria Visa fornece; não foi vetorizado nem substituído por outro desenho.
- [Visa Fundamental Brand Standards, setembro de 2025](https://corporate.visa.com/content/dam/VCOM/corporate/about-visa/documents/visa-brand-standards-sept2025.pdf), páginas 2–3.
- Visa Blue sobre fundo claro; versão branca reservada aos fundos escuros. Manter legibilidade e área livre: mínimo 0,5 X, com 1 X recomendado quando possível, sendo X a altura do V. Não distorcer, recolorir ou aplicar o modelo antigo Visa Flag. Os azulejos reservam pelo menos 0,5 X ao redor.
- O formulário de download profissional pede dados do solicitante; ele não foi preenchido. A arte utilizada é o SVG público efetivamente publicado pelo próprio Brand Center.

## Mastercard — mastercard.svg

- [Download Artwork — Websites & Apps / Mastercard Symbol](https://www.mastercard.com/brandcenter/us/en/download-artwork.html).
- [Pacote SVG oficial](https://www.mastercard.com/content/dam/brandcenter/assets/downloads/mc_symbol_SVG.zip), arquivo `Mastercard Symbol - SVG/Artwork/ma_symbol.svg`, copiado sem alterações.
- [Mastercard Branding Requirements](https://www.mastercard.com/brandcenter/us/en/brand-requirements/mastercard.html), seções Configurations, Minimum size e Minimum clear space. O pacote inclui o guia `mc_symbol_web-artwork_qrg_210112.pdf`.
- Usar o símbolo vermelho/amarelo em cores originais para sinalizar aceitação na web. Não usar escala de cinza quando a reprodução em cores está disponível. Proteção mínima de 1/4 do diâmetro de um círculo. O diagrama oficial indica mínimo digital de 24 px; o arquivo é exibido com largura superior a esse mínimo e mantém o respiro incorporado.

## Elo — elo.svg

- [Como usar a marca Elo](https://www.elo.com.br/marca-elo/).
- Arte: SVG positivo verde-mata incorporado ao cabeçalho dessa própria página oficial, `viewBox="0 0 86 28"`, copiado por serialização XML do elemento original. Nenhum traçado, proporção ou cor foi modificado; não se trata de um logo refeito.
- [Manual oficial da Elo — Toolkit 2025](https://media.elo.com.br/strapi-hml/Toolkit_2025_FINAL_1_6d6c00cb0f.pdf), página 3, seções Tamanho mínimo e Canais de aceitação.
- A seção de aceitação prefere a versão monocromática positiva e reduz a proteção a 1/2 X. Foi usada a arte positiva de uma única cor publicada pela Elo sobre branco, coerente com o exemplo dessa seção. Mínimo digital sem tagline de 20 px de altura; a linha menor preserva ao menos 24 px visuais. Não inclinar, aplicar sombra, alterar cores, espessuras ou espaçamento interno da marca.

## Conferência do checkout Cakto

[Checkout público desta oferta](https://pay.cakto.com.br/pabj6or_1277278), aberto sem preencher dados pessoais e sem realizar transação.

Opções observadas: **Pix, cartão de crédito, PicPay e Google Pay**. A seleção de cartão abriu os campos de cartão e parcelamento, mas não exibiu uma lista nominal das bandeiras aceitas. A presença da opção cartão não é tratada como prova da aceitação de cada bandeira.

O responsável confirmou expressamente a aceitação de **Visa, Mastercard e Elo** nesta oferta. Com essa confirmação, `PAYMENT_BRANDS` habilita `pix`, `visa`, `mastercard` e `elo` nos dois conjuntos de marcas. A confirmação das bandeiras veio do responsável, e não de uma inferência da interface pública. PicPay e Google Pay não foram adicionados à linha por não fazerem parte dos quatro logotipos solicitados.

## Integridade dos arquivos incluídos

SHA-256 das quatro artes entregues:

- pix-completo.svg: `f2720524a301b892aa3fd0922fd6bbceb9a9ac0bfd30aa2d68f2611397f1a808`
- visa.svg: `c3c7c0a81027ca7135a51ef4d7c4618c2529161e2ab4ad007db663c357c73d8c`
- mastercard.svg: `05df092590d7d56dd1531f25c8830ba2507d3d3aa2d19ad1649a59ce5a1a16f8`
- elo.svg: `413cb2465abf02c758c6b7e2163f7b20b928351e0c56664e599eeb03e22d4a12`
