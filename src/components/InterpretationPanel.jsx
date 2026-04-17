export default function InterpretationPanel({
  selectedTest,
  practiceQuestion,
  loadingDetail,
  testDetail,
}) {
  return (
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
  )
}
