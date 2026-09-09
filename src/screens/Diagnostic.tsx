import { useEffect, useState } from 'react'
import { DIAGNOSTIC, LEVEL_NAMES, suggestLevel, type DiagItem } from '../content/diagnostic'
import { matches } from '../lib/answers'
import { speak, voiceFor } from '../lib/tts'
import type { Language, StartLevel } from '../lib/types'
import { LANGUAGE_NAMES, SKILL_NAMES } from '../lib/types'
import { Button, Card, Notice, ProgressBar } from '../components/ui'

// Diagnóstico embutido no onboarding. Resultado = estimativa, não nível.

export function Diagnostic({ lang, onDone, onSkip }: { lang: Language; onDone: (level: StartLevel) => void; onSkip: () => void }) {
  const items = DIAGNOSTIC[lang]
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [text, setText] = useState('')
  const [hasVoice, setHasVoice] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    voiceFor(lang).then((v) => setHasVoice(!!v))
  }, [lang])

  if (finished) {
    const level = suggestLevel(correct)
    return (
      <div className="grid gap-4">
        <h2 className="text-xl font-bold">Resultado do diagnóstico</h2>
        <Card>
          <p>Você acertou <b>{correct} de {items.length}</b>.</p>
          <p className="mt-2">Ponto de partida sugerido: <b>{LEVEL_NAMES[level]}</b>.</p>
        </Card>
        <Notice kind="warn">
          Isto é uma <b>estimativa</b> com 8 perguntas, não uma avaliação de nível. Ela só define por onde o plano começa — você pode escolher outro ponto de partida.
        </Notice>
        <Button onClick={() => onDone(level)} block>Usar esta sugestão</Button>
        <Button variant="secondary" onClick={onSkip} block>Escolher eu mesmo</Button>
      </div>
    )
  }

  const item = items[i]
  const advance = (ok: boolean) => {
    if (ok) setCorrect((c) => c + 1)
    setText('')
    if (i + 1 >= items.length) setFinished(true)
    else setI(i + 1)
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-bold">Diagnóstico de {LANGUAGE_NAMES[lang]}</h2>
      <ProgressBar value={i / items.length} label={`Pergunta ${i + 1} de ${items.length} · ${SKILL_NAMES[item.skill]}`} />
      <DiagQuestion key={item.id} item={item} lang={lang} hasVoice={hasVoice} text={text} setText={setText} onAnswer={advance} />
      <Button variant="ghost" onClick={onSkip}>Pular o diagnóstico e começar do zero</Button>
    </div>
  )
}

function DiagQuestion({ item, lang, hasVoice, text, setText, onAnswer }: { item: DiagItem; lang: Language; hasVoice: boolean | null; text: string; setText: (s: string) => void; onAnswer: (ok: boolean) => void }) {
  if (item.skill === 'writing') {
    return (
      <Card>
        <p className="mb-3">{item.prompt}</p>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Sua resposta" autoCapitalize="none" autoCorrect="off" />
        <Button className="mt-3" block disabled={!text.trim()} onClick={() => onAnswer(matches(text, item.answers))}>Responder</Button>
      </Card>
    )
  }
  const listening = item.skill === 'listening'
  return (
    <Card>
      {listening && (
        hasVoice ? (
          <div className="mb-3 flex gap-2">
            <Button variant="secondary" onClick={() => speak(item.speak, lang, 1)}>▶ Ouvir</Button>
            <Button variant="secondary" onClick={() => speak(item.speak, lang, 0.8)}>▶ Devagar</Button>
          </div>
        ) : (
          <Notice kind="warn">
            Seu navegador não tem voz em {LANGUAGE_NAMES[lang]}; esta pergunta vai valer como leitura: <b>{item.speak}</b>
          </Notice>
        )
      )}
      <p className="my-3">{item.prompt}</p>
      <div className="grid gap-2">
        {item.options.map((o, idx) => (
          <button key={o} type="button" className="choice" onClick={() => onAnswer(idx === item.answer)}>{o}</button>
        ))}
      </div>
    </Card>
  )
}
