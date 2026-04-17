export default function LabReportResults({
  exam,
  results,
  onRetry,
  onBackToConfig,
}) {
  if (!exam || !results) {
    return null
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Resultados del examen
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Nota final
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Puntaje</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {results.score}
                </p>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">Correctas</p>
                <p className="mt-2 text-2xl font-semibold text-green-800">
                  {results.correctCount}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">Incorrectas</p>
                <p className="mt-2 text-2xl font-semibold text-red-800">
                  {results.incorrectCount}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Acierto</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {results.accuracy}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={onBackToConfig}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Nueva configuración
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Resumen por bloque</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.summaryByBlock.map((block) => (
            <div
              key={block.groupId}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-semibold text-slate-900">{block.groupName}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>Total: {block.total}</p>
                <p>Correctas: {block.correct}</p>
                <p>Incorrectas: {block.incorrect}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-slate-900">
            Revisión detallada
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-6 py-3 font-medium">Examen</th>
                <th className="px-6 py-3 font-medium">Valor mostrado</th>
                <th className="px-6 py-3 font-medium">Tu respuesta</th>
                <th className="px-6 py-3 font-medium">Respuesta correcta</th>
                <th className="px-6 py-3 font-medium">Resultado</th>
                <th className="px-6 py-3 font-medium">Explicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.rows.map((row) => (
                <tr key={row.id} className="align-top text-slate-700">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{row.testName}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.blockName}</p>
                  </td>
                  <td className="px-6 py-4">
                    {row.value} {row.unit}
                  </td>
                  <td className="px-6 py-4">{row.userAnswerLabel}</td>
                  <td className="px-6 py-4">{row.correctAnswerLabel}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        row.isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {row.isCorrect ? 'Correcto' : 'Incorrecto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{row.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
