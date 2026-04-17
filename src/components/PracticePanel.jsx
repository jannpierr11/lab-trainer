import {
  explanationForAnswer,
  labelAnswer,
  renderRange,
} from '../utils/practice'

export default function PracticePanel({
  practiceQuestion,
  practiceResult,
  testDetail,
  showRangesInPractice,
  onAnswerPractice,
  onStartPractice,
}) {
  if (!practiceQuestion) {
    return null
  }

  return (
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
              onClick={() => onAnswerPractice('bajo')}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Bajo
            </button>
            <button
              type="button"
              onClick={() => onAnswerPractice('normal')}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => onAnswerPractice('alto')}
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
                <p className="font-semibold text-slate-900">Error frecuente</p>
                <p className="mt-2 text-sm text-slate-700">
                  {testDetail.error_frecuente || 'No registrado'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-900">Perla clínica</p>
                <p className="mt-2 text-sm text-slate-700">
                  {testDetail.perla_clinica || 'No registrado'}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onStartPractice}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nueva pregunta
          </button>
        </div>
      )}
    </div>
  )
}
