import { renderRange } from '../utils/practice'

export default function TestList({
  selectedGroup,
  selectedTest,
  tests,
  loading,
  practiceScope,
  practiceDisabled,
  onSelectTest,
  onStartPractice,
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          {selectedGroup
            ? `Exámenes de ${selectedGroup.nombre}`
            : 'Selecciona un grupo'}
        </h2>

        {(selectedGroup ||
          practiceScope === 'all' ||
          practiceScope === 'selected') && (
          <button
            type="button"
            onClick={onStartPractice}
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

      {selectedGroup && loading && (
        <p className="mt-4 text-slate-700">Cargando exámenes...</p>
      )}

      {selectedGroup && !loading && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {tests.map((test) => (
            <button
              key={test.id}
              type="button"
              onClick={() => onSelectTest(test)}
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
  )
}
