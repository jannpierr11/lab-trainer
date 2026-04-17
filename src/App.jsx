import { useEffect, useMemo, useRef, useState } from 'react'
import AuthPanel from './components/AuthPanel'
import GroupGrid from './components/GroupGrid'
import InterpretationPanel from './components/InterpretationPanel'
import LabReportBuilder from './components/LabReportBuilder'
import LabReportView from './components/LabReportView'
import PracticePanel from './components/PracticePanel'
import PracticeSettings from './components/PracticeSettings'
import ProgressPanel from './components/ProgressPanel'
import TestList from './components/TestList'
import { supabase } from './lib/supabase'
import { buildReportSelection, createLabReport } from './utils/labReport'
import { generatePracticeValue } from './utils/practice'

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

function mapPracticeState(answer) {
  if (answer === 'normal') {
    return {
      estado: 'normal',
      direccion: null,
    }
  }

  return {
    estado: 'alterado',
    direccion: answer,
  }
}

export default function App() {
  const recentGeneratedValuesRef = useRef({})

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
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [error, setError] = useState('')

  const [practiceQuestion, setPracticeQuestion] = useState(null)
  const [practiceResult, setPracticeResult] = useState(null)
  const [showRangesInPractice, setShowRangesInPractice] = useState(false)
  const [practiceScope, setPracticeScope] = useState('group')
  const [practiceOnlyPriority, setPracticeOnlyPriority] = useState(true)

  const [progressSummary, setProgressSummary] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    sessionsCount: 0,
  })
  const [recentQuestions, setRecentQuestions] = useState([])

  const [activeMode, setActiveMode] = useState('practice')
  const [labReportSelection, setLabReportSelection] = useState({})
  const [labReportOnlyPriority, setLabReportOnlyPriority] = useState(true)
  const [labReportShowRanges, setLabReportShowRanges] = useState(true)
  const [generatedReport, setGeneratedReport] = useState(null)

  function resetAppState() {
    recentGeneratedValuesRef.current = {}
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
    setLoadingProgress(false)
    setError('')
    setActiveDailySession(null)
    setProgressSummary({
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      sessionsCount: 0,
    })
    setRecentQuestions([])
    setActiveMode('practice')
    setLabReportSelection({})
    setLabReportOnlyPriority(true)
    setLabReportShowRanges(true)
    setGeneratedReport(null)
  }

  function prepareAppForAuthenticatedSession() {
    setLoadingGroups(true)
    setLoadingAllTests(true)
    setLoadingTests(false)
    setLoadingDetail(false)
    setLoadingProgress(true)
    setError('')
  }

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      setSession(activeSession)

      if (!activeSession) {
        resetAppState()
      } else {
        prepareAppForAuthenticatedSession()
      }

      setAuthLoading(false)
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

    async function loadInitialProgress() {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('daily_sessions')
        .select('id, total_preguntas, correctas')
        .eq('user_id', session.user.id)
        .order('fecha', { ascending: false })

      if (sessionsError) {
        setError(sessionsError.message)
        setLoadingProgress(false)
        return
      }

      setProgressSummary(buildProgressSummary(sessionsData ?? []))

      const { data: questionsData, error: questionsError } = await supabase
        .from('daily_questions')
        .select(`
          id,
          test_id,
          valor_mostrado,
          respuesta_usuario_estado,
          respuesta_usuario_direccion,
          respuesta_correcta_estado,
          respuesta_correcta_direccion,
          fue_correcta,
          respondida_en,
          creado_en,
          daily_sessions!inner(user_id)
        `)
        .eq('daily_sessions.user_id', session.user.id)
        .order('respondida_en', { ascending: false, nullsFirst: false })
        .order('creado_en', { ascending: false })
        .limit(50)

      if (questionsError) {
        setError(questionsError.message)
        setRecentQuestions([])
        setLoadingProgress(false)
        return
      }

      setRecentQuestions(sortRecentQuestions(questionsData ?? []))
      setLoadingProgress(false)
    }

    loadGroups()
    loadAllTests()
    loadInitialProgress()
  }, [session])

  useEffect(() => {
    if (!groups.length) {
      setLabReportSelection({})
      return
    }

    setLabReportSelection((currentSelection) => {
      const defaultSelection = buildReportSelection(groups)

      for (const group of groups) {
        if (currentSelection[group.id]) {
          defaultSelection[group.id] = currentSelection[group.id]
        }
      }

      return defaultSelection
    })
  }, [groups])

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

  const labReportTestsByGroup = useMemo(() => {
    return groups.reduce((accumulator, group) => {
      accumulator[group.id] = allTests.filter((test) => {
        if (test.group_id !== group.id) {
          return false
        }

        if (labReportOnlyPriority && !test.es_prioritario) {
          return false
        }

        return true
      })

      return accumulator
    }, {})
  }, [groups, allTests, labReportOnlyPriority])

  const testNameById = useMemo(() => {
    return new Map(allTests.map((test) => [test.id, test.nombre]))
  }, [allTests])

  function buildPracticeQuestion(test) {
    const correctAnswer = getRandomPracticeAnswer()
    const recentValues = recentGeneratedValuesRef.current[test.id] ?? []
    const value = generatePracticeValue(test, correctAnswer, recentValues)

    recentGeneratedValuesRef.current = {
      ...recentGeneratedValuesRef.current,
      [test.id]: [value, ...recentValues].slice(0, 5),
    }

    return {
      test,
      value,
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

  function buildProgressSummary(sessions) {
    const totalQuestions = sessions.reduce(
      (sum, item) => sum + (item.total_preguntas ?? 0),
      0,
    )
    const correctAnswers = sessions.reduce(
      (sum, item) => sum + (item.correctas ?? 0),
      0,
    )

    return {
      totalQuestions,
      correctAnswers,
      accuracy:
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0,
      sessionsCount: sessions.length,
    }
  }

  function sortRecentQuestions(questions) {
    return [...questions]
      .map((item) => ({
        ...item,
        answered_at: item.respondida_en || item.creado_en || null,
      }))
      .sort((left, right) => {
        const leftValue = left.answered_at
          ? new Date(left.answered_at).getTime()
          : 0
        const rightValue = right.answered_at
          ? new Date(right.answered_at).getTime()
          : 0

        return rightValue - leftValue
      })
      .slice(0, 10)
  }

  async function loadProgress(userId = session?.user.id) {
    if (!userId) return

    setLoadingProgress(true)

    const { data: sessionsData, error: sessionsError } = await supabase
      .from('daily_sessions')
      .select('id, total_preguntas, correctas')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })

    if (sessionsError) {
      setError(sessionsError.message)
      setLoadingProgress(false)
      return
    }

    setProgressSummary(buildProgressSummary(sessionsData ?? []))

    const { data: questionsData, error: questionsError } = await supabase
      .from('daily_questions')
      .select(`
        id,
        test_id,
        valor_mostrado,
        respuesta_usuario_estado,
        respuesta_usuario_direccion,
        respuesta_correcta_estado,
        respuesta_correcta_direccion,
        fue_correcta,
        respondida_en,
        creado_en,
        daily_sessions!inner(user_id)
      `)
      .eq('daily_sessions.user_id', userId)
      .order('respondida_en', { ascending: false, nullsFirst: false })
      .order('creado_en', { ascending: false })
      .limit(50)

    if (questionsError) {
      setError(questionsError.message)
      setRecentQuestions([])
      setLoadingProgress(false)
      return
    }

    setRecentQuestions(sortRecentQuestions(questionsData ?? []))
    setLoadingProgress(false)
  }

  async function persistPracticeAnswer({
    dailySession,
    question,
    userAnswer,
    correctAnswer,
    wasCorrect,
  }) {
    const mappedUserAnswer = mapPracticeState(userAnswer)
    const mappedCorrectAnswer = mapPracticeState(correctAnswer)

    const { error: questionError } = await supabase.from('daily_questions').insert({
      session_id: dailySession.id,
      test_id: question.test.id,
      valor_mostrado: question.value,
      respondida_en: new Date().toISOString(),
      respuesta_usuario_estado: mappedUserAnswer.estado,
      respuesta_usuario_direccion: mappedUserAnswer.direccion,
      respuesta_correcta_estado: mappedCorrectAnswer.estado,
      respuesta_correcta_direccion: mappedCorrectAnswer.direccion,
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

    await loadProgress()
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

  function handleToggleLabReportGroup(groupId) {
    setLabReportSelection((currentSelection) => {
      const current = currentSelection[groupId]

      return {
        ...currentSelection,
        [groupId]: {
          ...current,
          enabled: !current.enabled,
        },
      }
    })
  }

  function handleToggleLabReportSelectAll(groupId) {
    setLabReportSelection((currentSelection) => {
      const current = currentSelection[groupId]

      return {
        ...currentSelection,
        [groupId]: {
          ...current,
          useAll: !current.useAll,
          testIds: !current.useAll ? [] : current.testIds,
        },
      }
    })
  }

  function handleToggleLabReportTest(groupId, testId) {
    setLabReportSelection((currentSelection) => {
      const current = currentSelection[groupId]
      const alreadySelected = current.testIds.includes(testId)

      return {
        ...currentSelection,
        [groupId]: {
          ...current,
          testIds: alreadySelected
            ? current.testIds.filter((id) => id !== testId)
            : [...current.testIds, testId],
        },
      }
    })
  }

  function handleGenerateLabReport() {
    const report = createLabReport({
      groups,
      testsByGroup: labReportTestsByGroup,
      selection: labReportSelection,
      recentValuesByTest: recentGeneratedValuesRef.current,
    })

    if (!report.blocks.length) {
      setError(
        'Selecciona al menos un bloque con exámenes disponibles antes de generar el examen.',
      )
      return
    }

    recentGeneratedValuesRef.current = report.nextRecentValues
    setGeneratedReport(report)
    setError('')
    setActiveMode('lab-report-view')
  }

  function handleBackToLabReportBuilder() {
    setActiveMode('lab-report-builder')
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
    }
  }

  function getTestName(testId) {
    return testNameById.get(testId) || `Examen #${testId}`
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
              Explorar grupos, exámenes, practicar y construir hojas de laboratorio.
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveMode('practice')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeMode === 'practice'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Modo práctica
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('lab-report-builder')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeMode === 'lab-report-builder' ||
              activeMode === 'lab-report-view'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Modo hoja de laboratorio
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {error}
          </div>
        )}

        {activeMode === 'practice' && (
          <>
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
          </>
        )}

        {activeMode === 'lab-report-builder' && (
          <LabReportBuilder
            groups={groups}
            testsByGroup={labReportTestsByGroup}
            selection={labReportSelection}
            onlyPriority={labReportOnlyPriority}
            showReferenceRanges={labReportShowRanges}
            loading={loadingGroups || loadingAllTests}
            onToggleGroup={handleToggleLabReportGroup}
            onToggleSelectAll={handleToggleLabReportSelectAll}
            onToggleTest={handleToggleLabReportTest}
            onOnlyPriorityChange={setLabReportOnlyPriority}
            onShowReferenceRangesChange={setLabReportShowRanges}
            onGenerateReport={handleGenerateLabReport}
          />
        )}

        {activeMode === 'lab-report-view' && (
          <LabReportView
            report={generatedReport}
            showReferenceRanges={labReportShowRanges}
            onBackToBuilder={handleBackToLabReportBuilder}
          />
        )}

        <ProgressPanel
          loading={loadingProgress}
          summary={progressSummary}
          recentQuestions={recentQuestions}
          getTestName={getTestName}
        />
      </div>
    </main>
  )
}
