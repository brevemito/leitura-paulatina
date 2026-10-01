# leitura-paulatina
https://brevemito.github.io/leitura-paulatina/
# Leitura Paulatina | Brevemito 

Assistente gratuito para motivar a leitura, um trecho de cada vez. Não tem contas, chaves API, servidor nem inteligência artificial. Usa apenas HTML, CSS, JavaScript e JSON, e guarda o progresso no próprio navegador (localStorage).

## Estrutura

index.html, style.css, app.js e a pasta lessons (index.json e um ficheiro JSON por livro).

## Como funciona

Cada trecho tem o texto original, um glossário e 5 perguntas de escolha múltipla com explicação. O site mostra os minutos lidos hoje (meta de 15 minutos), a sequência de dias de leitura e o progresso de cada livro.

## Como acrescentar um trecho

1. Abre lessons/linguagem-corporal.json e copia o último bloco de lição (entre chaves), colando-o a seguir, com uma vírgula entre os blocos.
2. Muda id, title, text, glossary, questions (answer é o índice da opção certa, a começar em 0) e summary.
3. Dentro do texto, as aspas duplas escrevem-se assim: \"

## Como acrescentar um livro

Cria lessons/novo-livro.json com a mesma estrutura e acrescenta {"id":"novo-livro","file":"novo-livro.json"} a lessons/index.json.

## Nota

Os textos pertencem aos respectivos autores e são usados para fins didácticos.
