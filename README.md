# Leitura Paulatina

**Um trecho por dia.** Livros divididos em trechos curtos, cada um com glossário, perguntas de compreensão e resumo, e partidas de xadrez comentadas lance a lance, num tabuleiro interactivo.

🔗 **Site:** https://leitura.brevemito.com
♟️ **Desafio de xadrez do dia:** https://leitura.brevemito.com/#desafio

Projecto do [Brevemito](https://brevemito.com). Gratuito, sem contas e sem anúncios intrusivos.

---

## Para quem é

Para quem quer criar o hábito de ler sem se perder num livro inteiro. O site propõe 15 minutos por dia, conta os dias seguidos de leitura e guarda o ponto onde a pessoa parou. Funciona bem no telemóvel e gasta poucos dados.

## Livros disponíveis

| Livro | Autor | Trechos | Tabuleiros |
|---|---|---:|---:|
| Desvendando os Segredos da Linguagem Corporal | Allan e Barbara Pease | 99 | 0 |
| Fundamentos do Xadrez (*Chess Fundamentals*) | José Raúl Capablanca | 50 | 44 |
| A República | Platão | 76 | 0 |
| Alcorão (tradução do sentido para a língua portuguesa) | Dr. Helmi Nasr | 24 | 0 |

## O que cada trecho tem

- **Texto** dividido em parágrafos curtos.
- **Glossário** com as palavras difíceis.
- **5 perguntas** de escolha múltipla, com a explicação da resposta certa.
- **Resumo** final e botão «Concluir trecho».
- **Partilha** por WhatsApp e Facebook, com um link directo para o trecho (ex.: `/#chess-fundamentals-038`).

No livro de xadrez, os trechos têm ainda:

- **Tabuleiros interactivos** que se percorrem lance a lance, com notas que explicam o porquê de cada lance e som de peça.
- **🧩 Desafios** escondidos nas notas: antes de um lance decisivo, o leitor é convidado a encontrá-lo.
- **Desafio de xadrez do dia**, igual para todos, com 3 tentativas, dica, modo treino e resultado para partilhar (por exemplo `❌✅ Acertei à 2.ª tentativa`).

## Como funciona

O site é estático: HTML, CSS, JavaScript e ficheiros JSON, publicados no GitHub Pages. Não há servidor, base de dados nem inteligência artificial a correr.

```
index.html          página única do site
style.css           aspecto visual
app.js              toda a lógica: livros, trechos, tabuleiros, desafio, partilha
og.png              imagem de pré-visualização nas redes sociais
CNAME               liga o repositório a leitura.brevemito.com (não apagar)
lessons/
  index.json        lista dos livros publicados
  <livro>.json      um ficheiro por livro, com todos os trechos
livros/             rascunhos de trechos em Markdown (não são lidos pelo site)
```

Ao abrir, o `app.js` lê o `lessons/index.json` e carrega cada livro indicado lá. Um livro que não esteja nessa lista, ou cujo JSON tenha um erro de sintaxe, não aparece no site.

### Bibliotecas externas

- [chess.js 0.10.3](https://github.com/jhlywa/chess.js) (licença BSD), carregada a partir do cdnjs, com o jsDelivr como reserva. Serve para saber quais são os lances legais no desafio do dia. Se não carregar, o desafio continua a funcionar, sem os pontos de lances possíveis.
- [GoatCounter](https://www.goatcounter.com), para estatísticas de visitas (ver «Privacidade»).

Os sons das peças são gerados no próprio navegador, sem ficheiros de áudio.

## Formato de um livro

Cada `lessons/<livro>.json` tem esta estrutura:

```json
{
  "title": "Título do livro",
  "author": "Autor",
  "lessons": [
    {
      "id": "001",
      "title": "Título do trecho",
      "text": ["Primeiro parágrafo.", "Segundo parágrafo."],
      "glossary": [{ "t": "Palavra", "d": "significado." }],
      "questions": [
        {
          "q": "Pergunta?",
          "options": ["Opção a", "Opção b", "Opção c", "Opção d"],
          "answer": 1,
          "why": "Explicação da resposta certa."
        }
      ],
      "summary": "Ideia principal do trecho."
    }
  ]
}
```

Regras que convém respeitar:

- `id` com três algarismos (`001`, `002`…), sem repetições dentro do livro.
- `answer` é a posição da opção certa, a contar do **0** (0 = a, 1 = b, 2 = c, 3 = d).
- Cada pergunta tem 4 opções; cada trecho, 5 perguntas.
- Aspas duplas dentro do texto escrevem-se `\"`.

### Tabuleiros de xadrez (opcional)

Um trecho pode ter o campo `diagrams`, com um ou mais tabuleiros:

```json
"diagrams": [
  {
    "after": 0,
    "title": "Título do tabuleiro",
    "kind": "capablanca",
    "source": "Capablanca, Fundamentos do Xadrez, …",
    "description": "O que observar.",
    "orientation": "w",
    "start": "<posição inicial em FEN>",
    "steps": [
      { "san": "Nf3", "from": "g1", "to": "f3", "fen": "<posição depois do lance>", "note": "Explicação (opcional)." }
    ]
  }
]
```

- `after`: o tabuleiro aparece a seguir ao parágrafo com esse número (a contar do 0).
- `kind`: `capablanca` (exemplo do livro), `historica` ou `didactica`.
- `orientation`: `w` para ver do lado das Brancas, `b` do lado das Pretas.
- Os lances (`san`) escrevem-se em notação inglesa (N, B, R, Q, K); o site mostra-os em notação portuguesa (C, B, T, D, R).
- Sem `steps`, o tabuleiro fica fixo, sem botões.
- Uma nota que contenha `🧩 Desafio:` passa a fazer parte do desafio do dia: a posição é a desse lance e a resposta é o lance seguinte.

Antes de publicar, convém confirmar que todos os lances são legais e que cada `fen` corresponde ao lance (por exemplo com a biblioteca `python-chess`). Um lance errado desarruma o tabuleiro a partir desse ponto.

## Como acrescentar conteúdo

**Um trecho novo:** no GitHub, abre o JSON do livro, copia o último bloco de trecho (de `{` até `}`), cola-o a seguir com uma vírgula entre os dois e altera os campos.

**Um livro novo:**

1. Cria `lessons/novo-livro.json` com a estrutura acima.
2. Acrescenta `{"id":"novo-livro","file":"novo-livro.json"}` ao `lessons/index.json`.

Depois de gravar, o GitHub Pages leva um ou dois minutos a actualizar o site. Se o livro não aparecer, quase sempre é uma vírgula ou uma chaveta a mais ou a menos: valida o ficheiro num validador de JSON antes de gravar.

## Testar no computador

Os ficheiros JSON só carregam através de um servidor, mesmo que local. Na pasta do repositório:

```bash
python -m http.server 8000
```

e abre `http://localhost:8000` no navegador.

## Privacidade

- O progresso (trechos lidos, respostas, minutos de leitura, sequência de dias, resultados do desafio) fica **só no navegador de cada pessoa** (`localStorage`). Não sai do aparelho e perde-se se a pessoa limpar os dados do navegador ou mudar de telemóvel.
- As estatísticas usam o GoatCounter, que **não usa cookies** nem guarda dados pessoais. Contam-se as páginas visitadas e alguns cliques (concluir trecho, partilhar, resultado do desafio), sempre de forma anónima.

## Direitos

O código deste repositório é do Brevemito. Os textos dos livros pertencem aos respectivos autores e tradutores e são usados com fins didácticos, em trechos curtos acompanhados de perguntas, glossário e comentário.

---

Feito em Moçambique, pelo [Brevemito](https://brevemito.com).
