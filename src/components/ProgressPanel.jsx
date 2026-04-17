import { formatAnsweredAt, formatStoredAnswer } from '../utils/practice'

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function ProgressPanel({
  loading,
  summary,
  recentQuestions,
  getTestName,
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Progreso</h2>
          <p className="mt-2 text-sm text-slate-600">
            Resumen básico de tus sesiones y últimas respuestas guardadas.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-slate-700">Cargando progreso...</p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Preguntas respondidas"
              value={summary.totalQuestions}
            />
            <StatCard
              label="Respuestas correctas"
              value={summary.correctAnswers}
            />
            <StatCard
              label="Porcentaje de acierto"
              value={`${summary.accuracy}%`}
            />
            <StatCard label="Sesiones registradas" value={summary.sessionsCount} />
          </div>

          {summary.totalQuestions === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Aún no hay progreso registrado. Responde una pregunta en modo práctica
              para empezar a ver tu resumen aquí.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Últimas 10 preguntas respondidas
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-600">
                      <th className="px-5 py-3 font-medium">Examen</th>
                      <th className="px-5 py-3 font-medium">Valor mostrado</th>
                      <th className="px-5 py-3 font-medium">Tu respuesta</th>
                      <th className="px-5 py-3 font-medium">Respuesta correcta</th>
                      <th className="px-5 py-3 font-medium">Resultado</th>
                      <th className="px-5 py-3 font-medium">Respondida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentQuestions.map((question) => (
                      <tr key={question.id} className="align-top text-slate-700">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {getTestName(question.test_id)}
                        </td>
                        <td className="px-5 py-4">{question.valor_mostrado}</td>
                        <td className="px-5 py-4">
                          {formatStoredAnswer(
                            question.respuesta_usuario_estado,
                            question.respuesta_usuario_direccion,
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {formatStoredAnswer(
                            question.respuesta_correcta_estado,
                            question.respuesta_correcta_direccion,
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              question.fue_correcta
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {question.fue_correcta ? 'Correcta' : 'Incorrecta'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatAnsweredAt(question.answered_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
