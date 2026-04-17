import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
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
  const [practiceScope, setPracticeScope] = useState('group') // group | all | selected
  const [practiceOnlyPriority, setPracticeOnlyPriority] = useState(true)

  useEffect(() => {
    async function loadGroups() {
      const { data, error } = await supabase
        .from('lab_groups')
        .select('id, nombre, slug, descripcion')
        .eq('activo', true)
        .order('prioridad', { ascending: true })
        .order('nombre', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setGroups(data ?? [])
      }

      setLoadingGroups(false)
    }

    async function loadAllTests() {
      const { data, error } = await supabase
        .from('lab_tests')
        .select(`
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
        `)
        .eq('activo', true)
        .order('prioridad', { ascending: true })
        .order('nombre', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setAllTests(data ?? [])
      }

      setLoadingAllTests(false)
    }

    loadGroups()
    loadAllTests()
  }, [])

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

    const { data, error } = await supabase
      .from('lab_tests')
      .select(`
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
      `)
      .eq('group_id', group.id)
      .eq('activo', true)
      .order('prioridad', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      setError(error.message)
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

    const { data, error } = await supabase
      .from('test_interpretations')
      .select(`
        si_bajo,
        si_normal,
        si_alto,
        nombre_alteracion_baja,
        nombre_alteracion_alta,
        error_frecuente,
        perla_clinica
      `)
      .eq('test_id', test.id)
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else {
      setTestDetail(data)
    }

    setLoadingDetail(false)
  }

  function getRange(test) {
    if (test.depende_sexo) {
      const min = Number(test.valor_min_ref_m)
      const max = Number(test.valor_max_ref_m)
      return {
        min,
        max,
        label: `M: ${test.valor_min_ref_m ?? '-'}–${test.valor_max_ref_m ?? '-'} | F: ${test.valor_min_ref_f ?? '-'}–${test.valor_max_ref_f ?? '-'}`
      }
    }

    const min = Number(test.valor_min_ref)
    const max = Number(test.valor_max_ref)
    return { min, max, label: `${min}–${max}` }
  }

  function renderRange(test) {
    return getRange(test).label
  }

  function roundSmart(value) {
    if (Number.isNaN(value)) return value
    if (Math.abs(value) >= 10) return Math.round(value * 10) / 10
    return Math.round(value * 100) / 100
  }

  function generateValue(test, type) {
    const { min, max } = getRange(test)
    const span = max - min

    if (type === 'normal') {
      const value = min + Math.random() * span
      return roundSmart(value)
    }

    const offset = span > 1 ? span * 0.3 : Math.max(span * 0.5, 0.1)

    if (type === 'bajo') {
      return roundSmart(min - offset)
    }

    return roundSmart(max + offset)
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

  function startPractice() {
    if (!practicePool.length) return

    const randomTest =
      practicePool[Math.floor(Math.random() * practicePool.length)]

    const options = ['bajo', 'normal', 'alto']
    const correctAnswer = options[Math.floor(Math.random() * options.length)]
    const generatedValue = generateValue(randomTest, correctAnswer)

    setSelectedTest(randomTest)
    setPracticeQuestion({
      test: randomTest,
      value: generatedValue,
      correctAnswer,
    })
    setPracticeResult(null)
    setTestDetail(null)
  }

  function startPracticeForSelectedTest() {
    if (!selectedTest) return
    setPracticeScope('selected')
    setPracticeQuestion(null)
    setPracticeResult(null)

    const options = ['bajo', 'normal', 'alto']
    const correctAnswer = options[Math.floor(Math.random() * options.length)]
    const generatedValue = generateValue(selectedTest, correctAnswer)

    setPracticeQuestion({
      test: selectedTest,
      value: generatedValue,
      correctAnswer,
    })
    setTestDetail(null)
  }

  async function answerPractice(userAnswer) {
    if (!practiceQuestion) return

    const wasCorrect = userAnswer === practiceQuestion.correctAnswer

    const { data, error } = await supabase
      .from('test_interpretations')
      .select(`
        si_bajo,
        si_normal,
        si_alto,
        nombre_alteracion_baja,
        nombre_alteracion_alta,
        error_frecuente,
        perla_clinica
      `)
      .eq('test_id', practiceQuestion.test.id)
      .maybeSingle()

    if (error) {
      setError(error.message)
      return
    }

    setTestDetail(data)
    setPracticeResult({
      userAnswer,
      correctAnswer: practiceQuestion.correctAnswer,
      wasCorrect,
    })
  }

  function explanationForAnswer(detail, answer) {
    if (!detail) return 'No registrado'
    if (answer === 'bajo') return detail.si_bajo || 'No registrado'
    if (answer === 'normal') return detail.si_normal || 'No registrado'
    return detail.si_alto || 'No registrado'
  }

  function labelAnswer(answer) {
    if (answer === 'bajo') return 'Bajo'
    if (answer === 'normal') return 'Normal'
    if (answer === 'alto') return 'Alto'
    return answer
  }

  const practiceDisabled =
    loadingAllTests ||
    (practiceScope === 'group' && !selectedGroup) ||
    (practiceScope === 'selected' && !selectedTest) ||
    practicePool.length === 0

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Lab Trainer
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Explorar grupos, exámenes e iniciar práctica
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {error}
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-900">Grupos</h2>

          {loadingGroups ? (
            <p className="mt-4 text-slate-700">Cargando grupos...</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleSelectGroup(group)}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${
                    selectedGroup?.id === group.id
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <h3 className="text-xl font-semibold text-slate-900">
                    {group.nombre}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {group.descripcion || 'Sin descripción'}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    slug: {group.slug}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              {selectedGroup
                ? `Exámenes de ${selectedGroup.nombre}`
                : 'Selecciona un grupo'}
            </h2>

            {(selectedGroup || practiceScope === 'all' || practiceScope === 'selected') && (
              <button
                type="button"
                onClick={startPractice}
                disabled={practiceDisabled}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                  practiceDisabled
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {practiceScope === 'all'
                  ? 'Practicar todos los exámenes'
                  : practiceScope === 'selected'
                  ? 'Practicar examen seleccionado'
                  : 'Practicar este grupo'}
              </button>
            )}
          </div>

          {!selectedGroup && (
            <p className="mt-4 text-slate-600">
              Haz clic en un grupo para ver sus exámenes.
            </p>
          )}

          {selectedGroup && loadingTests && (
            <p className="mt-4 text-slate-700">Cargando exámenes...</p>
          )}

          {selectedGroup && !loadingTests && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {tests.map((test) => (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => handleSelectTest(test)}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${
                    selectedTest?.id === test.id
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {test.nombre}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {test.es_prioritario ? 'Prioritario' : 'No prioritario'}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {test.descripcion_breve || 'Sin descripción breve'}
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Unidad:</span>{' '}
                      {test.unidad || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Rango:</span>{' '}
                      {renderRange(test)}
                    </p>
                    <p>
                      <span className="font-medium">Slug:</span> {test.slug}
                    </p>
                  </div>
                </button>
              ))}

              {tests.length === 0 && (
                <p className="text-slate-600">
                  No hay exámenes cargados para este grupo.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Modo práctica</h2>

          <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Fuente de preguntas
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="practiceScope"
                    value="group"
                    checked={practiceScope === 'group'}
                    onChange={() => {
                      setPracticeScope('group')
                      setPracticeQuestion(null)
                      setPracticeResult(null)
                    }}
                  />
                  Grupo actual
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="practiceScope"
                    value="all"
                    checked={practiceScope === 'all'}
                    onChange={() => {
                      setPracticeScope('all')
                      setPracticeQuestion(null)
                      setPracticeResult(null)
                    }}
                  />
                  Todos los exámenes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="practiceScope"
                    value="selected"
                    checked={practiceScope === 'selected'}
                    disabled={!selectedTest}
                    onChange={() => {
                      setPracticeScope('selected')
                      setPracticeQuestion(null)
                      setPracticeResult(null)
                    }}
                  />
                  Examen seleccionado
                </label>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">Filtros</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={practiceOnlyPriority}
                    onChange={(e) => {
                      setPracticeOnlyPriority(e.target.checked)
                      setPracticeQuestion(null)
                      setPracticeResult(null)
                    }}
                  />
                  Solo prioritarios
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showRangesInPractice}
                    onChange={(e) => setShowRangesInPractice(e.target.checked)}
                  />
                  Mostrar rangos durante la práctica
                </label>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">Resumen</p>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Modo:</span>{' '}
                  {practiceScope === 'all'
                    ? 'Todos los exámenes'
                    : practiceScope === 'selected'
                    ? 'Examen seleccionado'
                    : 'Grupo actual'}
                </p>
                <p>
                  <span className="font-medium">Grupo:</span>{' '}
                  {selectedGroup ? selectedGroup.nombre : 'Ninguno'}
                </p>
                <p>
                  <span className="font-medium">Examen:</span>{' '}
                  {selectedTest ? selectedTest.nombre : 'Ninguno'}
                </p>
                <p>
                  <span className="font-medium">Pool disponible:</span>{' '}
                  {practicePool.length} exámenes
                </p>
              </div>
            </div>
          </div>

          {selectedTest && (
            <div className="mt-4">
              <button
                type="button"
                onClick={startPracticeForSelectedTest}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Practicar solo este examen
              </button>
            </div>
          )}

          {!practiceQuestion && (
            <p className="mt-4 text-slate-600">
              {practiceScope === 'group'
                ? 'Selecciona un grupo y pulsa el botón de práctica.'
                : practiceScope === 'selected'
                ? 'Selecciona un examen y pulsa “Practicar solo este examen” o el botón principal.'
                : 'Pulsa el botón para practicar mezclando todos los exámenes disponibles.'}
            </p>
          )}

          {practiceQuestion && (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">
                    Pregunta actual
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                    {practiceQuestion.test.nombre}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {practiceQuestion.test.descripcion_breve || 'Sin descripción breve'}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {practiceQuestion.test.unidad || 'Sin unidad'}
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Valor mostrado</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {practiceQuestion.value}{' '}
                  <span className="text-lg font-medium text-slate-500">
                    {practiceQuestion.test.unidad || ''}
                  </span>
                </p>

                {showRangesInPractice && (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium">Rango:</span>{' '}
                    {renderRange(practiceQuestion.test)}
                  </p>
                )}
              </div>

              {!practiceResult && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-slate-700">
                    ¿Cómo interpretarías este valor?
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => answerPractice('bajo')}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                    >
                      Bajo
                    </button>
                    <button
                      type="button"
                      onClick={() => answerPractice('normal')}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => answerPractice('alto')}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                    >
                      Alto
                    </button>
                  </div>
                </div>
              )}

              {practiceResult && (
                <div className="mt-6 space-y-4">
                  <div
                    className={`rounded-2xl border p-4 ${
                      practiceResult.wasCorrect
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    <p className="text-base font-semibold">
                      {practiceResult.wasCorrect ? 'Correcto' : 'Incorrecto'}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Tu respuesta:</span>{' '}
                        {labelAnswer(practiceResult.userAnswer)}
                      </p>
                      <p>
                        <span className="font-medium">Respuesta correcta:</span>{' '}
                        {labelAnswer(practiceResult.correctAnswer)}
                      </p>
                      {!showRangesInPractice && (
                        <p>
                          <span className="font-medium">Rango:</span>{' '}
                          {renderRange(practiceQuestion.test)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      Explicación según el resultado correcto
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {explanationForAnswer(testDetail, practiceResult.correctAnswer)}
                    </p>
                  </div>

                  {testDetail && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="font-semibold text-slate-900">
                          Error frecuente
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          {testDetail.error_frecuente || 'No registrado'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="font-semibold text-slate-900">
                          Perla clínica
                        </p>
                        <p className="mt-2 text-sm text-slate-700">
                          {testDetail.perla_clinica || 'No registrado'}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startPractice}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Nueva pregunta
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            {selectedTest && !practiceQuestion
              ? `Interpretación de ${selectedTest.nombre}`
              : 'Selecciona un examen'}
          </h2>

          {!selectedTest && !practiceQuestion && (
            <p className="mt-4 text-slate-600">
              Haz clic en un examen para ver su interpretación.
            </p>
          )}

          {selectedTest && loadingDetail && !practiceQuestion && (
            <p className="mt-4 text-slate-700">Cargando interpretación...</p>
          )}

          {selectedTest && !loadingDetail && testDetail && !practiceQuestion && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Si está bajo</p>
                  <p className="mt-1">{testDetail.si_bajo || 'No registrado'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Si está normal</p>
                  <p className="mt-1">{testDetail.si_normal || 'No registrado'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Si está alto</p>
                  <p className="mt-1">{testDetail.si_alto || 'No registrado'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Nombre de alteración baja
                  </p>
                  <p className="mt-1">
                    {testDetail.nombre_alteracion_baja || 'No registrado'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Nombre de alteración alta
                  </p>
                  <p className="mt-1">
                    {testDetail.nombre_alteracion_alta || 'No registrado'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Error frecuente</p>
                  <p className="mt-1">
                    {testDetail.error_frecuente || 'No registrado'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Perla clínica</p>
                  <p className="mt-1">
                    {testDetail.perla_clinica || 'No registrado'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTest && !loadingDetail && !testDetail && !practiceQuestion && (
            <p className="mt-4 text-slate-600">
              Este examen no tiene interpretación registrada.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}