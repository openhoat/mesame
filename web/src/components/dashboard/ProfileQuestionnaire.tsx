import {
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Radio,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModelSelector } from '@/components/ModelSelector'

interface QuestionnaireAnswers {
  // Step 1: Identity
  name: string
  role: string
  expertise: string

  // Step 2: Writing Style
  tone: 'formal' | 'neutral' | 'casual' | ''
  complexity: 'simple' | 'moderate' | 'complex' | ''
  preferences: string

  // Step 3: Values & Philosophy
  values: string
  approach: string
  examples: string
}

interface ProfileQuestionnaireProps {
  onComplete: () => void
  onCancel: () => void
}

export const ProfileQuestionnaire = ({ onComplete, onCancel }: ProfileQuestionnaireProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    name: '',
    role: '',
    expertise: '',
    tone: '',
    complexity: '',
    preferences: '',
    values: '',
    approach: '',
    examples: '',
  })
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const updateAnswer = (field: keyof QuestionnaireAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return answers.name.trim() && answers.role.trim() && answers.expertise.trim()
      case 2:
        return answers.tone && answers.complexity
      case 3:
        return answers.values.trim() && answers.approach.trim()
      case 4:
        return true
      default:
        return false
    }
  }

  const generateSourceContent = (): string => {
    const sections = [
      '# Digital Twin Profile',
      '',
      '## Personal Identity',
      `Name: ${answers.name}`,
      `Role: ${answers.role}`,
      `Domain of Expertise: ${answers.expertise}`,
      '',
      '## Writing Style',
      `Tone: ${answers.tone}`,
      `Complexity Level: ${answers.complexity}`,
    ]

    if (answers.preferences.trim()) {
      sections.push(`Style Preferences: ${answers.preferences}`)
    }

    sections.push(
      '',
      '## Values & Philosophy',
      `Core Values: ${answers.values}`,
      `Approach: ${answers.approach}`
    )

    if (answers.examples.trim()) {
      sections.push('', '## Communication Examples', answers.examples)
    }

    return sections.join('\n')
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      // 1. Create source from questionnaire answers
      const sourceContent = generateSourceContent()
      const sourceResponse = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Digital Twin - ${answers.name}`,
          content: sourceContent,
        }),
      })

      if (!sourceResponse.ok) throw new Error('Failed to create source')

      const source = await sourceResponse.json()

      // 2. Create profile from source
      const profileResponse = await fetch('/api/style-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${answers.name}'s Digital Twin`,
          sourceIds: [source.id],
          modelId: selectedModel,
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
            <Title order={3}>{t('questionnaire.step1.title') || 'Tell us about yourself'}</Title>
            <Text c="dimmed">
              {t('questionnaire.step1.subtitle') || 'Help us understand your identity and role'}
            </Text>

            <TextInput
              label={t('questionnaire.step1.name') || 'Name'}
              placeholder={t('questionnaire.step1.namePlaceholder') || 'Your name or alias'}
              value={answers.name}
              onChange={e => updateAnswer('name', e.target.value)}
              required
            />

            <TextInput
              label={t('questionnaire.step1.role') || 'Role / Title'}
              placeholder={
                t('questionnaire.step1.rolePlaceholder') || 'e.g., Software Engineer, Writer, CEO'
              }
              value={answers.role}
              onChange={e => updateAnswer('role', e.target.value)}
              required
            />

            <Textarea
              label={t('questionnaire.step1.expertise') || 'Domain of Expertise'}
              placeholder={
                t('questionnaire.step1.expertisePlaceholder') ||
                'Describe your areas of knowledge and experience'
              }
              value={answers.expertise}
              onChange={e => updateAnswer('expertise', e.target.value)}
              minRows={3}
              required
            />
          </Stack>
        )

      case 2:
        return (
          <Stack gap="md">
            <Title order={3}>{t('questionnaire.step2.title') || 'Define your writing style'}</Title>
            <Text c="dimmed">
              {t('questionnaire.step2.subtitle') || 'How do you prefer to communicate?'}
            </Text>

            <div>
              <Text size="sm" fw={500} mb="xs">
                {t('questionnaire.step2.tone') || 'Tone'}
              </Text>
              <Radio.Group value={answers.tone} onChange={value => updateAnswer('tone', value)}>
                <Stack gap="xs">
                  <Radio
                    value="formal"
                    label={
                      t('questionnaire.step2.toneFormal') || 'Formal - Professional and polished'
                    }
                  />
                  <Radio
                    value="neutral"
                    label={
                      t('questionnaire.step2.toneNeutral') || 'Neutral - Balanced and objective'
                    }
                  />
                  <Radio
                    value="casual"
                    label={
                      t('questionnaire.step2.toneCasual') || 'Casual - Friendly and conversational'
                    }
                  />
                </Stack>
              </Radio.Group>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                {t('questionnaire.step2.complexity') || 'Complexity Level'}
              </Text>
              <Radio.Group
                value={answers.complexity}
                onChange={value => updateAnswer('complexity', value)}
              >
                <Stack gap="xs">
                  <Radio
                    value="simple"
                    label={
                      t('questionnaire.step2.complexitySimple') || 'Simple - Clear and accessible'
                    }
                  />
                  <Radio
                    value="moderate"
                    label={
                      t('questionnaire.step2.complexityModerate') ||
                      'Moderate - Balanced with some detail'
                    }
                  />
                  <Radio
                    value="complex"
                    label={
                      t('questionnaire.step2.complexityComplex') ||
                      'Complex - Technical and in-depth'
                    }
                  />
                </Stack>
              </Radio.Group>
            </div>

            <Textarea
              label={t('questionnaire.step2.preferences') || 'Additional Preferences (Optional)'}
              placeholder={
                t('questionnaire.step2.preferencesPlaceholder') ||
                'e.g., Use of metaphors, humor, storytelling'
              }
              value={answers.preferences}
              onChange={e => updateAnswer('preferences', e.target.value)}
              minRows={3}
            />
          </Stack>
        )

      case 3:
        return (
          <Stack gap="md">
            <Title order={3}>
              {t('questionnaire.step3.title') || 'Your values and philosophy'}
            </Title>
            <Text c="dimmed">
              {t('questionnaire.step3.subtitle') || 'What drives your thinking and decisions?'}
            </Text>

            <Textarea
              label={t('questionnaire.step3.values') || 'Core Values'}
              placeholder={
                t('questionnaire.step3.valuesPlaceholder') ||
                'Describe the principles and values that guide you'
              }
              value={answers.values}
              onChange={e => updateAnswer('values', e.target.value)}
              minRows={3}
              required
            />

            <Textarea
              label={t('questionnaire.step3.approach') || 'Approach & Methodology'}
              placeholder={
                t('questionnaire.step3.approachPlaceholder') ||
                'How do you approach problems and make decisions?'
              }
              value={answers.approach}
              onChange={e => updateAnswer('approach', e.target.value)}
              minRows={3}
              required
            />

            <Textarea
              label={t('questionnaire.step3.examples') || 'Communication Examples (Optional)'}
              placeholder={
                t('questionnaire.step3.examplesPlaceholder') ||
                'Share examples of how you typically communicate or express ideas'
              }
              value={answers.examples}
              onChange={e => updateAnswer('examples', e.target.value)}
              minRows={4}
            />
          </Stack>
        )

      case 4:
        return (
          <Stack gap="md">
            <Title order={3}>{t('questionnaire.step4.title') || 'Review & Create'}</Title>
            <Text c="dimmed">
              {t('questionnaire.step4.subtitle') || 'Review your profile and create it'}
            </Text>

            <Paper p="md" withBorder>
              <Stack gap="sm">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {t('questionnaire.step4.identity') || 'Identity'}
                  </Text>
                  <Text fw={600}>{answers.name}</Text>
                  <Text size="sm">{answers.role}</Text>
                  <Text size="sm" c="dimmed">
                    {answers.expertise}
                  </Text>
                </div>

                <Divider />

                <div>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {t('questionnaire.step4.style') || 'Style'}
                  </Text>
                  <Text size="sm">
                    {t(
                      `questionnaire.step2.tone${answers.tone.charAt(0).toUpperCase()}${answers.tone.slice(1)}`
                    ) || answers.tone}{' '}
                    •{' '}
                    {t(
                      `questionnaire.step2.complexity${answers.complexity.charAt(0).toUpperCase()}${answers.complexity.slice(1)}`
                    ) || answers.complexity}
                  </Text>
                  {answers.preferences && (
                    <Text size="sm" c="dimmed">
                      {answers.preferences}
                    </Text>
                  )}
                </div>

                <Divider />

                <div>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {t('questionnaire.step4.values') || 'Values'}
                  </Text>
                  <Text size="sm">{answers.values}</Text>
                </div>
              </Stack>
            </Paper>

            <Divider />

            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              label={t('questionnaire.step4.model') || 'Model for generation'}
              placeholder={t('questionnaire.step4.modelPlaceholder') || 'Select model'}
              size="sm"
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
            {t('questionnaire.step') || 'Step'} {step} {t('questionnaire.of') || 'of'} {totalSteps}
          </Text>
          <Text size="sm" c="dimmed">
            {Math.round(progress)}%
          </Text>
        </Group>
        <Progress value={progress} size="sm" />
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
          {step === 1 ? t('common.cancel') || 'Cancel' : t('common.back') || 'Back'}
        </Button>

        {step < totalSteps ? (
          <Button
            rightSection={<ArrowRight size={16} />}
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            {t('common.next') || 'Next'}
          </Button>
        ) : (
          <Button
            leftSection={<Sparkles size={16} />}
            rightSection={<Check size={16} />}
            onClick={handleCreate}
            loading={creating}
            disabled={creating}
          >
            {t('questionnaire.createProfile') || 'Create Profile'}
          </Button>
        )}
      </Group>
    </Stack>
  )
}
