# Fazendinha Virtual (protótipo)

Este ZIP é um protótipo jogável em HTML/CSS/JS (sem frameworks) com:

- Tela do Vaso (igual ao layout da imagem 1) com botões **Escolher Semente**, **Plantar**, **Regar**, **Colher**
- Plantas com **3 estágios**: para avançar, precisa **regar** em cada estágio
- Tela do Rancho (imagem 2) acessível com **arrastar para o lado**
- Comprar até **3 animais** e ganhar moedas com o tempo
- **Relógio real**
- **Progresso offline**: ao abrir novamente, calcula o tempo passado (usando timestamps no localStorage)

## Como rodar
1. Extraia o ZIP
2. Abra `index.html` no navegador (Chrome/Edge/Firefox)

> Dica: em alguns navegadores, certas APIs ficam mais estáveis se você rodar via servidor local.
> Se quiser: `python -m http.server` na pasta e abra o endereço que aparecer.

## Próximos ajustes que podemos fazer
- Refinar o posicionamento dos botões (hit areas) para ficar 100% em cima dos botões da arte
- Trocar os SVGs das plantas por PNGs do seu estilo (Colheita Feliz)
- Adicionar mais sementes/animais, missões, loja, inventário, etc.


## V5
- Adicionada lista de 20 sementes com preço, tempo de crescimento (>=10 min) e valor de venda.
- Loja de sementes + inventário.
- Plantar consome 1 semente; colher paga o valor de venda.


## V14 (Plantas por semente)
- Criada pasta `assets/plants/` com PNGs placeholder para 20 sementes (3 estágios cada).
- Para trocar pela sua arte: substitua os arquivos seguindo o padrão `seedId_1.png`, `seedId_2.png`, `seedId_3.png`.
- Ex.: `assets/plants/morango_1.png`, `morango_2.png`, `morango_3.png`.
- Se algum PNG não existir, o jogo usa o SVG genérico como fallback.


## V15 (Ajuste visual da planta)
- Planta reposicionada e escalonada por estágio (1/2/3) para ficar mais natural no vaso.
- Adicionada sombra no chão do vaso para dar profundidade.


## V16
- Moedas iniciais ajustadas para 100.
- HUD (moedas e relógio) reposicionado para dentro da tela do celular.


## V18
- Modal de sementes reformulado: menu lateral à esquerda com ícones por categoria.
- Lista à direita mostra apenas a categoria selecionada.
- Lista ordenada por preço; busca continua funcionando.


## V19
- Gerados placeholders PNG para TODAS as 50 sementes (150 arquivos: 3 estágios cada) em `assets/plants/`.


## V20 (Tamanho por tipo)
- Ajuste visual automático por grupo de semente (Hortaliças menores, Árvores maiores etc.).
- Implementado via `getPlantVisualTuning(seedId)` e variáveis CSS.


## V21 (Animação de crescimento)
- Adicionada animação suave (scale + fade) quando a planta muda de estágio.


## V22
- Corrigido bloqueio de cliques causado por camadas da planta.
- Corrigido lock ao salvar estado durante animação.


## V24
- Valor inicial padrão definido em 100 moedas para novos jogadores.
- Correção para saves antigos sem dinheiro inicial.


## V26
- Fluxo de sementes ajustado:
  - Botão da esquerda agora é "Comprar sementes" (abre Loja).
  - Botão "Plantar" abre o Inventário para escolher a semente.
  - Ao selecionar no inventário, planta automaticamente (se o vaso estiver vazio).


## V30
- Migração de save: se o jogador tinha save antigo com money 0/ inválido, ganha 100 moedas sem perder progresso.


## V31
- Migração de moedas mais robusta: usa flag `moneyInitialized`.
- Saves antigos (sem flag) com money 0/ inválido recebem 100 uma única vez, sem apagar progresso.


## V32
- Música de fundo: `assets/audio/bgm.mp3` + controles (liga/desliga e volume).
- HUD de moedas reforçado (sempre visível dentro do celular).
- Migração de save: se save antigo não tinha `moneyInitialized` e money inválido/<=0, ganha 100 uma única vez.
