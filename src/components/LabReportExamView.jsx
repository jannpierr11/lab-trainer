function AnswerPills({ value, onChange }) {
  const options = [
    { id: 'alto', label: 'Alto' },
    { id: 'normal', label: 'Normal' },
    { id: 'bajo', label: 'Bajo' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            value === option.id
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ExamTable({ block, showReferenceRanges, answers, onAnswerChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{block.group.nombre}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {block.group.descripcion || 'Bloque sin descripción'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-6 py-3 font-medium">Determinación</th>
              <th className="px-6 py-3 font-medium">Resultado</th>
              <th className="px-6 py-3 font-medium">Unidad</th>
              {showReferenceRanges && (
                <th className="px-6 py-3 font-medium">Valores de referencia</th>
              )}
              <th className="px-6 py-3 font-medium">Respuesta del usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {block.entries.map((entry) => (
              <tr key={entry.id} className="text-slate-700">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {entry.test.nombre}
                </td>
                <td className="px-6 py-4 text-slate-900">{entry.value}</td>
                <td className="px-6 py-4">{entry.test.unidad || '—'}</td>
                {showReferenceRanges && (
                  <td className="px-6 py-4 text-slate-600">{entry.referenceRange}</td>
                )}
                <td className="px-6 py-4">
                  <AnswerPills
                    value={answers[entry.id] ?? null}
                    onChange={(nextValue) => onAnswerChange(entry.id, nextValue)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function LabReportExamView({
  exam,
  config,
  answers,
  onAnswerChange,
  onBackToConfig,
  onFinishExam,
}) {
  if (!exam) {
    return null
  }

  const answeredCount = exam.blocks.reduce((sum, block) => {
    return (
      sum +
      block.entries.filter((entry) => Boolean(answers[entry.id])).length
    )
  }, 0)

  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Examen en curso
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Hoja de resultados
            </h2>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Bloques:</span>{' '}
                {exam.blocks.length}
              </p>
              <p>
                <span className="font-medium text-slate-900">Determinaciones:</span>{' '}
                {exam.totalEntries}
              </p>
              <p>
                <span className="font-medium text-slate-900">Respondidas:</span>{' '}
                {answeredCount}/{exam.totalEntries}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Temporizador</p>
              <p className="mt-1">
                {config.timerMinutes === '0'
                  ? 'No configurado'
                  : `${config.timerMinutes} min (placeholder)`}
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToConfig}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Volver a configurar
            </button>
            <button
              type="button"
              onClick={onFinishExam}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Finalizar examen
            </button>
          </div>
        </div>
      </div>

      {config.combineBlocks ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {exam.blocks.map((block) => (
              <ExamTable
                key={block.group.id}
                block={block}
                showReferenceRanges={config.showReferenceRanges}
                answers={answers}
                onAnswerChange={onAnswerChange}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {exam.blocks.map((block) => (
            <ExamTable
              key={block.group.id}
              block={block}
              showReferenceRanges={config.showReferenceRanges}
              answers={answers}
              onAnswerChange={onAnswerChange}
            />
          ))}
        </div>
      )}
    </section>
  )
}
