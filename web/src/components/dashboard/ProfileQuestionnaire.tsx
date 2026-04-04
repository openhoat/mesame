import { Button, Chip, Group, Paper, Stack, Text, Textarea, Title } from '@mantine/core'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { API } from '@/config/api'

interface QuestionnaireAnswers {
  // Step 1: Passions & Interests
  passions: string[]
  talkAbout: string
  hobbies: string

  // Step 2: Tone & Communication
  tone: 'enthusiastic' | 'calm' | 'direct' | 'narrative' | 'analytical' | 'humorous' | ''
  complexityReaction: 'explain-simply' | 'deep-dive' | 'ask-questions' | 'give-opinion' | ''
  favoritePhrase: string

  // Step 3: Philosophy & Examples (optional)
  motivations: string
  philosophy: string
  passionExample: string
  frustrations: string
}

interface ProfileQuestionnaireProps {
  onComplete: () => void
  onCancel: () => void
}

export const ProfileQuestionnaire = ({ onComplete, onCancel }: ProfileQuestionnaireProps) => {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    passions: [],
    talkAbout: '',
    hobbies: '',
    tone: '',
    complexityReaction: '',
    favoritePhrase: '',
    motivations: '',
    philosophy: '',
    passionExample: '',
    frustrations: '',
  })
  const [creating, setCreating] = useState(false)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const updateAnswer = (field: keyof QuestionnaireAnswers, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const togglePassion = (passion: string) => {
    setAnswers(prev => ({
      ...prev,
      passions: prev.passions.includes(passion)
        ? prev.passions.filter(p => p !== passion)
        : [...prev.passions, passion],
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return answers.passions.length > 0 && answers.talkAbout.trim() && answers.hobbies.trim()
      case 2:
        return answers.tone && answers.complexityReaction && answers.favoritePhrase.trim()
      case 3:
        return true // Optional step
      default:
        return false
    }
  }

  const generateSourceContent = (): string => {
    const parts: string[] = []

    // Opening with passions
    const passionLabels: Record<string, string> = {
      technology: 'la technologie',
      science: 'la science',
      art: "l'art",
      business: 'le business',
      nature: 'la nature',
      sport: 'le sport',
      culture: 'la culture',
      other: 'autres',
    }
    const passionTexts = answers.passions.map(p => passionLabels[p] || p)
    parts.push(`Je suis quelqu'un de passionné par ${passionTexts.join(', ')}.`)

    // What I like to talk about
    if (answers.talkAbout.trim()) {
      parts.push(answers.talkAbout.trim())
    }

    // Hobbies
    if (answers.hobbies.trim()) {
      parts.push(`Mes centres d'intérêt : ${answers.hobbies.trim()}.`)
    }

    // Tone and communication style
    const toneMap: Record<string, string> = {
      enthusiastic: 'enthousiaste et énergique',
      calm: 'calme et réfléchi',
      direct: 'direct et concret',
      narrative: 'narratif et storyteller',
      analytical: 'analytique et précis',
      humorous: 'humoristique et léger',
    }

    const complexityMap: Record<string, string> = {
      'explain-simply': "J'aime expliquer les choses simplement avec des exemples concrets.",
      'deep-dive': "J'aime approfondir les sujets avec des détails techniques.",
      'ask-questions': 'Je pose des questions pour clarifier avant de répondre.',
      'give-opinion': 'Je donne mon opinion franchement et directement.',
    }

    parts.push(`Mon ton est naturellement ${toneMap[answers.tone] || 'neutre'}.`)
    parts.push(complexityMap[answers.complexityReaction] || '')

    // Favorite phrase
    if (answers.favoritePhrase.trim()) {
      parts.push(`Une phrase qui me ressemble : "${answers.favoritePhrase.trim()}"`)
    }

    // Motivations
    if (answers.motivations.trim()) {
      parts.push(answers.motivations.trim())
    }

    // Philosophy
    if (answers.philosophy.trim()) {
      parts.push(answers.philosophy.trim())
    }

    // Passion example
    if (answers.passionExample.trim()) {
      parts.push(`Quand j'explique un concept qui me passionne : ${answers.passionExample.trim()}`)
    }

    // Frustrations
    if (answers.frustrations.trim()) {
      parts.push(`Ce qui me frustre : ${answers.frustrations.trim()}`)
    }

    return parts.filter(Boolean).join(' ')
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      // 1. Create source from questionnaire answers
      const sourceContent = generateSourceContent()
      const sourceResponse = await fetch(API.sources(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Profil Digital Twin`,
          content: sourceContent,
        }),
      })

      if (!sourceResponse.ok) throw new Error('Failed to create source')

      const source = await sourceResponse.json()

      // 2. Create profile from source
      const profileResponse = await fetch(API.styleProfile(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mon Digital Twin',
          sourceIds: [source.id],
        }),
      })

      if (!profileResponse.ok) throw new Error('Failed to create profile')

      onComplete()
    } catch (_error) {
      // Handle error silently
    } finally {
      setCreating(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Stack gap="md">
            <Title order={3}>Vos passions et intérêts</Title>
            <Text c="dimmed">Qu'est-ce qui vous passionne et vous anime ?</Text>

            <div>
              <Text size="sm" fw={500} mb="xs">
                Qu'est-ce qui vous passionne ?
              </Text>
              <Group gap="xs">
                {['technology', 'science', 'art', 'business', 'nature', 'sport', 'culture'].map(
                  passion => (
                    <Chip
                      key={passion}
                      checked={answers.passions.includes(passion)}
                      onClick={() => togglePassion(passion)}
                    >
                      {passion === 'technology' && 'Technologie'}
                      {passion === 'science' && 'Science'}
                      {passion === 'art' && 'Art'}
                      {passion === 'business' && 'Business'}
                      {passion === 'nature' && 'Nature'}
                      {passion === 'sport' && 'Sport'}
                      {passion === 'culture' && 'Culture'}
                    </Chip>
                  )
                )}
              </Group>
            </div>

            <Textarea
              label="De quoi aimez-vous parler ?"
              placeholder="J'aime parler de nouvelles technologies, d'innovation..."
              value={answers.talkAbout}
              onChange={e => updateAnswer('talkAbout', e.target.value)}
              minRows={2}
              required
            />

            <Textarea
              label="Vos centres d'intérêt et hobbies"
              placeholder="Lecture, voyages, photographie, jeux vidéo..."
              value={answers.hobbies}
              onChange={e => updateAnswer('hobbies', e.target.value)}
              minRows={2}
              required
            />
          </Stack>
        )

      case 2:
        return (
          <Stack gap="md">
            <Title order={3}>Ton et communication</Title>
            <Text c="dimmed">Comment communiquez-vous naturellement ?</Text>

            <div>
              <Text size="sm" fw={500} mb="xs">
                Votre ton naturel ?
              </Text>
              <Group gap="xs">
                {[
                  { value: 'enthusiastic', label: 'Enthousiaste' },
                  { value: 'calm', label: 'Calme' },
                  { value: 'direct', label: 'Direct' },
                  { value: 'narrative', label: 'Narratif' },
                  { value: 'analytical', label: 'Analytique' },
                  { value: 'humorous', label: 'Humoristique' },
                ].map(tone => (
                  <Chip
                    key={tone.value}
                    checked={answers.tone === tone.value}
                    onClick={() => updateAnswer('tone', tone.value as QuestionnaireAnswers['tone'])}
                  >
                    {tone.label}
                  </Chip>
                ))}
              </Group>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                Face à un sujet complexe, vous ?
              </Text>
              <Group gap="xs">
                {[
                  { value: 'explain-simply', label: 'Expliquez simplement' },
                  { value: 'deep-dive', label: 'Approfondissez' },
                  { value: 'ask-questions', label: 'Posez des questions' },
                  { value: 'give-opinion', label: 'Donnez votre avis' },
                ].map(reaction => (
                  <Chip
                    key={reaction.value}
                    checked={answers.complexityReaction === reaction.value}
                    onClick={() =>
                      updateAnswer(
                        'complexityReaction',
                        reaction.value as QuestionnaireAnswers['complexityReaction']
                      )
                    }
                  >
                    {reaction.label}
                  </Chip>
                ))}
              </Group>
            </div>

            <Textarea
              label="Une phrase qui vous ressemble"
              placeholder="La curiosité est le moteur de tout progrès."
              value={answers.favoritePhrase}
              onChange={e => updateAnswer('favoritePhrase', e.target.value)}
              minRows={1}
              required
            />
          </Stack>
        )

      case 3:
        return (
          <Stack gap="md">
            <Title order={3}>Philosophie et exemples (optionnel)</Title>
            <Text c="dimmed">Enrichissez votre profil avec plus de détails</Text>

            <Textarea
              label="Qu'est-ce qui vous motive ?"
              placeholder="Apprendre et découvrir de nouvelles choses..."
              value={answers.motivations}
              onChange={e => updateAnswer('motivations', e.target.value)}
              minRows={2}
            />

            <Textarea
              label="Votre philosophie en 2-3 phrases"
              placeholder="Je crois en l'apprentissage continu..."
              value={answers.philosophy}
              onChange={e => updateAnswer('philosophy', e.target.value)}
              minRows={2}
            />

            <Textarea
              label="Comment présentez-vous un concept qui vous passionne ?"
              placeholder="Imaginez un monde où... C'est ce que permet..."
              value={answers.passionExample}
              onChange={e => updateAnswer('passionExample', e.target.value)}
              minRows={2}
            />

            <Textarea
              label="Un sujet qui vous énerve ou vous frustre"
              placeholder="Les gens qui refusent d'apprendre de leurs erreurs..."
              value={answers.frustrations}
              onChange={e => updateAnswer('frustrations', e.target.value)}
              minRows={2}
            />
          </Stack>
        )

      default:
        return null
    }
  }

  return (
    <Stack gap="lg">
      <div>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Étape {step} sur {totalSteps}
          </Text>
          <Text size="sm" c="dimmed">
            {Math.round(progress)}%
          </Text>
        </Group>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${step} of ${totalSteps}`}
          style={{ width: '100%', height: 4, backgroundColor: '#e9ecef', borderRadius: 2 }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#228be6',
              borderRadius: 2,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      <Paper p="xl" withBorder>
        {renderStep()}
      </Paper>

      <Group justify="space-between">
        <Button
          variant="default"
          leftSection={step === 1 ? undefined : <ArrowLeft size={16} />}
          onClick={() => {
            if (step === 1) {
              onCancel()
            } else {
              setStep(step - 1)
            }
          }}
        >
          {step === 1 ? 'Annuler' : 'Retour'}
        </Button>

        {step < totalSteps ? (
          <Button
            rightSection={<ArrowRight size={16} />}
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Suivant
          </Button>
        ) : (
          <Button
            leftSection={<Sparkles size={16} />}
            rightSection={<Check size={16} />}
            onClick={handleCreate}
            loading={creating}
            disabled={creating}
          >
            Créer le profil
          </Button>
        )}
      </Group>
    </Stack>
  )
}
