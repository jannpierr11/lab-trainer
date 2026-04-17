import { useEffect, useMemo, useState } from 'react'
import AuthPanel from './components/AuthPanel'
import GroupGrid from './components/GroupGrid'
import InterpretationPanel from './components/InterpretationPanel'
import PracticePanel from './components/PracticePanel'
import PracticeSettings from './components/PracticeSettings'
import TestList from './components/TestList'
import { supabase } from './lib/supabase'
import { generateValue } from './utils/practice'

const LAB_TESTS_SELECT = `
  id,
  group_id,
  nombre,
  slug,
  unidad,
  descripcion_breve,
  es_prioritario,
  depende_sexo,
  valor_min_ref,
  valor_max_ref,
  valor_min_ref_m,
  valor_max_ref_m,
  valor_min_ref_f,
  valor_max_ref_f
`

const INTERPRETATIONS_SELECT = `
  si_bajo,
  si_normal,
  si_alto,
  nombre_alteracion_baja,
  nombre_alteracion_alta,
  error_frecuente,
  perla_clinica
`

const PRACTICE_OPTIONS = ['bajo', 'normal', 'alto']

function getRandomPracticeAnswer() {
  return PRACTICE_OPTIONS[Math.floor(Math.random() * PRACTICE_OPTIONS.length)]
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeDailySession, setActiveDailySession] = useState(null)

  const [groups, setGroups] = useState([])
  const [allTests, setAllTests] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [testDetail, setTestDetail] = useState(null)

  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingAllTests, setLoadingAllTests] = useState(true)
  const [loadingTests, setLoadingTests] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState('')

  const [practiceQuestion, setPracticeQuestion] = useState(null)
  const [practiceResult, setPracticeResult] = useState(null)
  const [showRangesInPractice, setShowRangesInPractice] = useState(false)
  const [practiceScope, setPracticeScope] = useState('group')
  const [practiceOnlyPriority, setPracticeOnlyPriority] = useState(true)

  function resetAppState() {
    setGroups([])
    setAllTests([])
    setSelectedGroup(null)
    setTests([])
    setSelectedTest(null)
    setTestDetail(null)
    setPracticeQuestion(null)
    setPracticeResult(null)
    setShowRangesInPractice(false)
    setPracticeScope('group')
    setPracticeOnlyPriority(true)
    setLoadingGroups(false)
    setLoadingAllTests(false)
    setLoadingTests(false)
    setLoadingDetail(false)
    setError('')
    setActiveDailySession(null)
  }

  function prepareAppForAuthenticatedSession() {
    setLoadingGroups(true)
    setLoadingAllTests(true)
    setLoadingTests(false)
    setLoadingDetail(false)
    setError('')
  }

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession()

      if (isMounted) {
        setSession(activeSession)
        if (!activeSession) {
          resetAppState()
        } else {
          prepareAppForAuthenticatedSession()
        }
        setAuthLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        resetAppState()
      } else {
        prepareAppForAuthenticatedSession()
      }
      setAuthLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      return
    }

    async function loadGroups() {
      const { data, error: groupsError } = await supabase
        .from('lab_groups')
        .select('id, nombre, slug, descripcion')
        .eq('activo', true)
        .order('prioridad', { ascending: true })
        .order('nombre', { ascending: true })

      if (groupsError) {
        setError(groupsError.message)
      } else {
        setGroups(data ?? [])
      }

      setLoadingGroups(false)
    }

    async function loadAllTests() {
      const { data, error: testsError } = await supabase
        .from('lab_tests')
        .select(LAB_TESTS_SELECT)
        .eq('activo', true)
        .order('prioridad', { ascending: true })
        .order('nombre', { ascending: true })

      if (testsError) {
        setError(testsError.message)
      } else {
        setAllTests(data ?? [])
      }

      setLoadingAllTests(false)
    }

    loadGroups()
    loadAllTests()
  }, [session])

  async function handleSelectGroup(group) {
    setSelectedGroup(group)
    setSelectedTest(null)
    setTestDetail(null)
    setPracticeQuestion(null)
    setPracticeResult(null)
    setLoadingTests(true)
    setError('')
    setTests([])

    if (practiceScope === 'selected') {
      setPracticeScope('group')
    }

    const { data, error: testsError } = await supabase
      .from('lab_tests')
      .select(LAB_TESTS_SELECT)
      .eq('group_id', group.id)
      .eq('activo', true)
      .order('prioridad', { ascending: true })
      .order('nombre', { ascending: true })

    if (testsError) {
      setError(testsError.message)
    } else {
      setTests(data ?? [])
    }

    setLoadingTests(false)
  }

  async function handleSelectTest(test) {
    setSelectedTest(test)
    setPracticeQuestion(null)
    setPracticeResult(null)
    setLoadingDetail(true)
    setError('')
    setTestDetail(null)

    const { data, error: detailError } = await supabase
      .from('test_interpretations')
      .select(INTERPRETATIONS_SELECT)
      .eq('test_id', test.id)
      .maybeSingle()

    if (detailError) {
      setError(detailError.message)
    } else {
      setTestDetail(data)
    }

    setLoadingDetail(false)
  }

  const practicePool = useMemo(() => {
    let pool = []

    if (practiceScope === 'group') {
      pool = tests
    } else if (practiceScope === 'all') {
      pool = allTests
    } else if (practiceScope === 'selected') {
      pool = selectedTest ? [selectedTest] : []
    }

    if (practiceOnlyPriority) {
      pool = pool.filter((test) => test.es_prioritario)
    }

    return pool
  }, [practiceScope, practiceOnlyPriority, tests, allTests, selectedTest])

  function buildPracticeQuestion(test) {
    const correctAnswer = getRandomPracticeAnswer()

    return {
      test,
      value: generateValue(test, correctAnswer),
      correctAnswer,
    }
  }

  function resetPracticeFeedback() {
    setPracticeQuestion(null)
    setPracticeResult(null)
  }

  function getPracticeDate() {
    return new Date().toLocaleDateString('en-CA')
  }

  function resolvePracticeMode(scope) {
    return scope
  }

  function resolvePracticeGroupId(scope) {
    if (scope === 'group') {
      return selectedGroup?.id ?? null
    }

    if (scope === 'selected') {
      return selectedTest?.group_id ?? null
    }

    return null
  }

  async function ensureDailySession(scopeOverride = practiceScope) {
    const mode = resolvePracticeMode(scopeOverride)
    const groupId = resolvePracticeGroupId(scopeOverride)

    if (
      activeDailySession &&
      activeDailySession.mode === mode &&
      activeDailySession.groupId === groupId
    ) {
      return activeDailySession
    }

    const payload = {
      user_id: session.user.id,
      fecha: getPracticeDate(),
      modo: mode,
      group_id: groupId,
      total_preguntas: 0,
      correctas: 0,
    }

    const { data, error: sessionError } = await supabase
      .from('daily_sessions')
      .insert(payload)
      .select('id, modo, group_id, total_preguntas, correctas')
      .single()

    if (sessionError) {
      setError(sessionError.message)
      return null
    }

    const nextSession = {
      id: data.id,
      mode: data.modo,
      groupId: data.group_id,
      totalQuestions: data.total_preguntas ?? 0,
      correctAnswers: data.correctas ?? 0,
    }

    setActiveDailySession(nextSession)
    return nextSession
  }

  async function persistPracticeAnswer({
    dailySession,
    question,
    userAnswer,
    correctAnswer,
    wasCorrect,
  }) {
    const { error: questionError } = await supabase.from('daily_questions').insert({
      session_id: dailySession.id,
      test_id: question.test.id,
      valor_mostrado: question.value,
      respuesta_usuario_estado: userAnswer,
      respuesta_correcta_estado: correctAnswer,
      fue_correcta: wasCorrect,
    })

    if (questionError) {
      setError(questionError.message)
      return
    }

    const nextTotals = {
      total_preguntas: dailySession.totalQuestions + 1,
      correctas: dailySession.correctAnswers + (wasCorrect ? 1 : 0),
    }

    const { error: updateError } = await supabase
      .from('daily_sessions')
      .update(nextTotals)
      .eq('id', dailySession.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setActiveDailySession({
      ...dailySession,
      totalQuestions: nextTotals.total_preguntas,
      correctAnswers: nextTotals.correctas,
    })
  }

  function handlePracticeScopeChange(scope) {
    setPracticeScope(scope)
    resetPracticeFeedback()
  }

  function handlePracticeOnlyPriorityChange(value) {
    setPracticeOnlyPriority(value)
    resetPracticeFeedback()
  }

  async function startPractice() {
    if (!practicePool.length) return

    const randomTest =
      practicePool[Math.floor(Math.random() * practicePool.length)]

    await ensureDailySession()
    setSelectedTest(randomTest)
    setPracticeQuestion(buildPracticeQuestion(randomTest))
    setPracticeResult(null)
    setTestDetail(null)
  }

  async function startPracticeForSelectedTest() {
    if (!selectedTest) return

    await ensureDailySession('selected')
    setPracticeScope('selected')
    setPracticeQuestion(buildPracticeQuestion(selectedTest))
    setPracticeResult(null)
    setTestDetail(null)
  }

  async function answerPractice(userAnswer) {
    if (!practiceQuestion) return

    const wasCorrect = userAnswer === practiceQuestion.correctAnswer
    const dailySession = await ensureDailySession()

    const { data, error: detailError } = await supabase
      .from('test_interpretations')
      .select(INTERPRETATIONS_SELECT)
      .eq('test_id', practiceQuestion.test.id)
      .maybeSingle()

    if (detailError) {
      setError(detailError.message)
      return
    }

    setTestDetail(data)
    setPracticeResult({
      userAnswer,
      correctAnswer: practiceQuestion.correctAnswer,
      wasCorrect,
    })

    if (dailySession) {
      await persistPracticeAnswer({
        dailySession,
        question: practiceQuestion,
        userAnswer,
        correctAnswer: practiceQuestion.correctAnswer,
        wasCorrect,
      })
    }
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
    }
  }

  const practiceDisabled =
    loadingAllTests ||
    (practiceScope === 'group' && !selectedGroup) ||
    (practiceScope === 'selected' && !selectedTest) ||
    practicePool.length === 0

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Cargando sesión...
        </div>
      </main>
    )
  }

  if (!session) {
    return <AuthPanel />
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Lab Trainer
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Explorar grupos, exámenes e iniciar práctica
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Sesión activa: {session.user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {error}
          </div>
        )}

        <GroupGrid
          groups={groups}
          loading={loadingGroups}
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
        />

        <TestList
          selectedGroup={selectedGroup}
          selectedTest={selectedTest}
          tests={tests}
          loading={loadingTests}
          practiceScope={practiceScope}
          practiceDisabled={practiceDisabled}
          onSelectTest={handleSelectTest}
          onStartPractice={startPractice}
        />

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            Modo práctica
          </h2>

          <PracticeSettings
            practiceScope={practiceScope}
            practiceOnlyPriority={practiceOnlyPriority}
            showRangesInPractice={showRangesInPractice}
            practiceQuestion={practiceQuestion}
            selectedGroup={selectedGroup}
            selectedTest={selectedTest}
            practicePoolCount={practicePool.length}
            onPracticeScopeChange={handlePracticeScopeChange}
            onPracticeOnlyPriorityChange={handlePracticeOnlyPriorityChange}
            onShowRangesChange={setShowRangesInPractice}
            onStartPracticeForSelectedTest={startPracticeForSelectedTest}
          />

          <PracticePanel
            practiceQuestion={practiceQuestion}
            practiceResult={practiceResult}
            testDetail={testDetail}
            showRangesInPractice={showRangesInPractice}
            onAnswerPractice={answerPractice}
            onStartPractice={startPractice}
          />
        </section>

        <InterpretationPanel
          selectedTest={selectedTest}
          practiceQuestion={practiceQuestion}
          loadingDetail={loadingDetail}
          testDetail={testDetail}
        />
      </div>
    </main>
  )
}
