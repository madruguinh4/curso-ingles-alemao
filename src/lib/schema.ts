import { z } from 'zod'

export const LanguageSchema = z.enum(['en', 'de'])
export const SkillSchema = z.enum(['listening', 'reading', 'writing', 'speaking'])
export const LevelSchema = z.enum(['A1', 'A2', 'B1'])

export const VocabItemSchema = z
  .object({
    id: z.string().min(1),
    term: z.string().min(1),
    translation: z.string().min(1),
    example: z.string().min(1),
    exampleTranslation: z.string().min(1),
    noun: z.boolean().optional(),
    article: z.string().min(1).optional(),
    plural: z.string().min(1).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.noun) {
      if (!v.article) ctx.addIssue({ code: 'custom', path: ['article'], message: 'Substantivo exige article' })
      if (!v.plural) ctx.addIssue({ code: 'custom', path: ['plural'], message: 'Substantivo exige plural' })
    }
  })

const base = { id: z.string().min(1), skill: SkillSchema, explanation: z.string().min(1) }

export const ExerciseSchema = z.discriminatedUnion('type', [
  z
    .object({ ...base, type: z.literal('choice'), prompt: z.string().min(1), options: z.array(z.string().min(1)).min(2), answer: z.number().int().nonnegative() })
    .refine((e) => e.answer < e.options.length, { path: ['answer'], message: 'answer fora do intervalo de options' }),
  z.object({ ...base, type: z.literal('gap'), prompt: z.string().includes('___'), answers: z.array(z.string().min(1)).min(1) }),
  z.object({ ...base, type: z.literal('order'), prompt: z.string().min(1), tokens: z.array(z.string().min(1)).min(2), answer: z.string().min(1) }),
  z.object({ ...base, type: z.literal('transform'), prompt: z.string().min(1), instruction: z.string().min(1), answers: z.array(z.string().min(1)).min(1) }),
  z.object({ ...base, type: z.literal('dictation'), text: z.string().min(1), answers: z.array(z.string().min(1)).min(1), lang: LanguageSchema }),
  z.object({
    id: z.string().min(1),
    type: z.literal('free'),
    skill: z.enum(['writing', 'speaking']),
    prompt: z.string().min(1),
    model: z.string().min(1),
    checklist: z.array(z.string().min(1)).min(1),
  }),
])

export const DialogueLineSchema = z.object({ speaker: z.string().min(1), text: z.string().min(1), translation: z.string().min(1) })

// Uma ideia por tela: o cartão "aprender" mostra uma frase com áudio e, no
// máximo, uma regra de uma linha (sem jargão) e um par errado → certo.
export const LearnStepSchema = z.object({
  type: z.literal('learn'),
  text: z.string().min(1),
  translation: z.string().min(1),
  rule: z.string().min(1).optional(),
  avoid: z.object({ wrong: z.string().min(1), right: z.string().min(1) }).optional(),
})

export const DialogueStepSchema = z.object({ type: z.literal('dialogue'), lines: z.array(DialogueLineSchema).min(2) })

export const StepSchema = z.union([LearnStepSchema, DialogueStepSchema, ExerciseSchema])

export const LessonSchema = z
  .object({
    id: z.string().regex(/^(en|de)-w\d{2}-l\d$/),
    weekId: z.string().regex(/^(en|de)-w\d{2}$/),
    language: LanguageSchema,
    title: z.string().min(1),
    objective: z.string().min(1),
    steps: z.array(StepSchema).min(4),
    production: ExerciseSchema.refine((e) => e.type === 'free', { message: 'production deve ser type free' }),
    vocabulary: z.array(VocabItemSchema).min(3),
  })
  .superRefine((l, ctx) => {
    if (!l.id.startsWith(l.weekId + '-')) ctx.addIssue({ code: 'custom', path: ['weekId'], message: 'weekId não bate com id' })
    if (l.language !== l.id.slice(0, 2)) ctx.addIssue({ code: 'custom', path: ['language'], message: 'language não bate com id' })
    if (l.steps[0]?.type !== 'learn') ctx.addIssue({ code: 'custom', path: ['steps', 0], message: 'a aula começa com um cartão learn' })
    l.steps.forEach((s, i) => {
      if (s.type === 'free') ctx.addIssue({ code: 'custom', path: ['steps', i], message: 'produção livre fica em production' })
    })
  })

export const WeekSchema = z.object({
  id: z.string().regex(/^(en|de)-w\d{2}$/),
  language: LanguageSchema,
  number: z.number().int().min(1).max(52),
  month: z.number().int().min(1).max(12),
  level: LevelSchema,
  title: z.string().min(1),
  canDo: z.string().min(1),
  grammar: z.array(z.string().min(1)).min(1),
  vocabulary: z.array(z.string().min(1)).min(1),
  skills: z.array(SkillSchema).min(1),
})

export function validateLesson(json: unknown, file: string) {
  const r = LessonSchema.safeParse(json)
  if (!r.success) {
    const issues = r.error.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`).join('; ')
    throw new Error(`Aula inválida em ${file}: ${issues}`)
  }
  return r.data
}
