// Glossário de termos gramaticais em português. Nenhum termo é usado no
// conteúdo sem estar aqui: o texto das aulas marca [[termo]] e o app mostra a
// definição ao toque. O teste de conteúdo falha se um [[termo]] não existir.

export interface Term {
  /** chave usada no conteúdo: [[contração]] */
  key: string
  title: string
  definition: string
  example: string
}

export const GLOSSARY: Term[] = [
  { key: 'contração', title: 'Contração', definition: 'Duas palavras juntas em uma, com um apóstrofo (\') no lugar das letras que caíram. Na fala é a forma normal; a forma completa fica para textos formais ou para dar ênfase.', example: 'I am → I\'m · you are → you\'re · it is → it\'s' },
  { key: 'apóstrofo', title: 'Apóstrofo', definition: 'O sinal (\') que marca letras que caíram em uma contração ou, em inglês, a posse.', example: 'I\'m (I am) · Ana\'s car (o carro da Ana)' },
  { key: 'pronome', title: 'Pronome', definition: 'Palavra que substitui um nome. Os pronomes sujeito dizem quem faz a ação.', example: 'I, you, he, she, it, we, they · ich, du, er, sie, es, wir, ihr, sie/Sie' },
  { key: 'sujeito', title: 'Sujeito', definition: 'Quem faz a ação ou de quem se fala na frase. Em inglês e alemão o sujeito quase nunca pode ser omitido — diferente do português ("sou a Ana").', example: 'I am Ana. · Ich bin Ana. (não se diz "am Ana" / "bin Ana")' },
  { key: 'verbo', title: 'Verbo', definition: 'A palavra que indica ação, estado ou existência. Muda de forma conforme quem faz a ação e o tempo.', example: 'to be (ser/estar): I am, you are · sein: ich bin, du bist' },
  { key: 'conjugação', title: 'Conjugação', definition: 'As formas que um verbo assume conforme a pessoa (eu, você, ele…) e o tempo. Em alemão a terminação muda a cada pessoa; em inglês só na 3ª pessoa do presente.', example: 'ich komm-e, du komm-st, Sie komm-en · I come, she come-s' },
  { key: 'terminação', title: 'Terminação', definition: 'A parte final de uma palavra que muda para marcar pessoa, número ou caso.', example: 'komm-st (du) · komm-en (Sie) · Häus-er (plural)' },
  { key: 'artigo', title: 'Artigo', definition: 'Palavrinha antes do substantivo que indica se é algo específico (o, a) ou genérico (um, uma). Em alemão o artigo também mostra o gênero e o caso.', example: 'a car / the car · der Tisch, die Lampe, das Haus' },
  { key: 'substantivo', title: 'Substantivo', definition: 'Palavra que nomeia pessoas, coisas, lugares e ideias. Em alemão todo substantivo tem letra maiúscula e um gênero (der/die/das) que precisa ser memorizado junto com a palavra.', example: 'name, city, house · der Name, die Stadt, das Haus' },
  { key: 'gênero', title: 'Gênero', definition: 'A "categoria" do substantivo: em alemão, masculino (der), feminino (die) ou neutro (das). Não segue lógica de sentido: "a menina" é das Mädchen. Memorize sempre com o artigo.', example: 'der Tisch (masc.) · die Lampe (fem.) · das Buch (neutro)' },
  { key: 'plural', title: 'Plural', definition: 'A forma que indica mais de um. Em inglês quase sempre é -s; em alemão há vários padrões e por isso o plural é memorizado junto com a palavra.', example: 'car → cars · das Haus → die Häuser · der Name → die Namen' },
  { key: 'singular', title: 'Singular', definition: 'A forma que indica um só — o oposto de plural. É a forma que aparece no dicionário.', example: 'a car (um carro) · ein Haus (uma casa)' },
  { key: 'adjetivo', title: 'Adjetivo', definition: 'Palavra que descreve um substantivo (como é). Em inglês não muda; em alemão muda a terminação quando vem antes do substantivo.', example: 'a hot day · ein heißer Tag / das heiße Wasser' },
  { key: 'preposição', title: 'Preposição', definition: 'Palavrinha que liga e indica relação de lugar, tempo ou origem. Em alemão cada preposição exige um caso.', example: 'from Brazil, in London, at 8 · aus Brasilien, in Berlin, um 8 Uhr' },
  { key: 'advérbio', title: 'Advérbio', definition: 'Palavra que diz como, quando, onde ou com que frequência algo acontece.', example: 'always, here, today · immer, hier, heute' },
  { key: 'sílaba tônica', title: 'Sílaba tônica', definition: 'A sílaba mais forte da palavra. Errar a tônica atrapalha mais a compreensão do que o sotaque.', example: 'Bra-ZIL (não BRA-zil) · Ja-PAN · CA-na-da' },
  { key: 'registro', title: 'Registro (formal / informal)', definition: 'O grau de formalidade da fala: como você fala com um chefe é diferente de como fala com um amigo. Em alemão isso está na gramática (du / Sie); em inglês, na escolha das palavras.', example: 'Good morning, Ms. Lee / Hey, Ju! · Wie geht es Ihnen? / Wie geht\'s?' },
  { key: 'caso', title: 'Caso', definition: 'Em alemão, a "função" que uma palavra tem na frase (quem faz, quem recebe a ação, para quem…). O caso muda o artigo e às vezes a terminação. São quatro: nominativo, acusativo, dativo e genitivo — você aprende um de cada vez.', example: 'der Hund (nominativo) → den Hund (acusativo) → dem Hund (dativo)' },
  { key: 'nominativo', title: 'Nominativo', definition: 'O caso do sujeito: quem faz a ação ou de quem se fala. É a forma "de dicionário" do artigo: der / die / das.', example: 'Der Hund schläft. (o cachorro dorme)' },
  { key: 'acusativo', title: 'Acusativo', definition: 'O caso do objeto direto: quem ou o que recebe a ação. Só o masculino muda: der → den, ein → einen.', example: 'Ich sehe den Hund. · Ich habe einen Hund.' },
  { key: 'dativo', title: 'Dativo', definition: 'O caso de "para quem / a quem" e de várias preposições (mit, aus, zu, bei…). Artigos: dem / der / dem / den (+ -n no plural).', example: 'Ich helfe dem Mann. · Ich komme aus der Schweiz.' },
  { key: 'genitivo', title: 'Genitivo', definition: 'O caso da posse ("de quem"). Na fala é raro; aparece em textos e com algumas preposições (wegen, trotz).', example: 'das Auto des Mannes (o carro do homem)' },
  { key: 'umlaut', title: 'Umlaut', definition: 'Os dois pontinhos sobre a, o, u (ä ö ü). Não são enfeite: mudam o som e às vezes a palavra. ä ≈ "é" aberto; ö = "ê" com lábios de "o"; ü = "i" com lábios de "u".', example: 'schon (já) ≠ schön (bonito) · Haus → Häuser' },
  { key: 'ß', title: 'ß (Eszett)', definition: 'Letra que soa como "ss". Só existe em minúscula e nunca começa palavra. Na Suíça escreve-se "ss".', example: 'heißen = "háissen" · Straße = "chtrásse"' },
  { key: 'verbo separável', title: 'Verbo separável', definition: 'Verbo alemão com um prefixo que se solta e vai para o fim da frase.', example: 'aufstehen → Ich stehe um 7 Uhr auf.' },
  { key: 'verbo modal', title: 'Verbo modal', definition: 'Verbo que expressa possibilidade, obrigação, vontade ou permissão e acompanha outro verbo. Em inglês: can, must, should…; em alemão: können, müssen, wollen… (o outro verbo vai para o fim).', example: 'I can swim. · Ich kann schwimmen.' },
  { key: 'V2', title: 'Posição V2 (verbo em segundo lugar)', definition: 'Regra do alemão: na frase afirmativa, o verbo conjugado é sempre o segundo elemento — não a segunda palavra. Se algo vem antes (hoje, amanhã…), o sujeito passa para depois do verbo.', example: 'Ich wohne in Berlin. · Heute wohne ich in Berlin.' },
  { key: 'oração subordinada', title: 'Oração subordinada', definition: 'Um pedaço de frase que depende de outro, introduzido por palavras como "porque", "que", "se". Em alemão o verbo vai para o fim dela.', example: '…, weil ich müde bin. · …, dass er kommt.' },
  { key: 'particípio', title: 'Particípio', definition: 'A forma do verbo usada em tempos compostos ("tenho comido") e na voz passiva. Inglês: worked, gone; alemão: gemacht, gegangen.', example: 'I have worked. · Ich habe gearbeitet.' },
  { key: 'infinitivo', title: 'Infinitivo', definition: 'A forma "de dicionário" do verbo, sem conjugação.', example: 'to be, to come · sein, kommen' },
  { key: 'tempo verbal', title: 'Tempo verbal', definition: 'A forma do verbo que situa a ação no tempo: presente, passado ou futuro.', example: 'I work (presente) · I worked (passado) · I will work (futuro)' },
  { key: 'pergunta sim/não', title: 'Pergunta de sim ou não', definition: 'Pergunta que se responde com sim ou não. Em inglês e alemão, o verbo vai para a frente.', example: 'Are you from Rio? · Kommst du aus Rio?' },
  { key: 'resposta curta', title: 'Resposta curta', definition: 'Em inglês, responder repetindo o verbo: "Yes, I am." / "No, I\'m not." — nunca com contração no fim ("Yes, I\'m" está errado).', example: 'Are you Brazilian? — Yes, I am. / No, I\'m not.' },
  { key: 'nacionalidade', title: 'Nacionalidade', definition: 'A palavra que diz de que país alguém é. Em inglês é um adjetivo com maiúscula (Brazilian); em alemão é um substantivo (Brasilianer / Brasilianerin).', example: 'I\'m Brazilian. · Ich bin Brasilianer.' },
  { key: 'formas fracas', title: 'Formas fracas', definition: 'Em inglês, palavrinhas como "are", "to", "and" quase somem na fala rápida. Reconhecê-las é essencial para entender falantes nativos.', example: '"Where are you from?" soa como "wher-ya from?"' },
]

const byKey = new Map(GLOSSARY.map((t) => [t.key.toLowerCase(), t]))
export const getTerm = (key: string): Term | undefined => byKey.get(key.toLowerCase())

/** Extrai as chaves [[termo]] ou [[termo|texto]] de um texto. */
export function termsIn(text: string): string[] {
  return [...text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim())
}
