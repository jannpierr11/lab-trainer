function BlockSelector({
  group,
  tests,
  selected,
  onToggleGroup,
  onToggleSelectAll,
  onToggleTest,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected.enabled}
            onChange={() => onToggleGroup(group.id)}
            className="mt-1"
          />
          <span>
            <span className="block text-lg font-semibold text-slate-900">
              {group.nombre}
            </span>
            <span className="mt-1 block text-sm text-slate-600">
              {group.descripcion || 'Sin descripción'}
            </span>
          </span>
        </label>

        {selected.enabled && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={selected.useAll}
              onChange={() => onToggleSelectAll(group.id)}
            />
            Usar todos los exámenes
          </label>
        )}
      </div>

      {selected.enabled && !selected.useAll && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {tests.map((test) => (
            <label
              key={test.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={selected.testIds.includes(test.id)}
                onChange={() => onToggleTest(group.id, test.id)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-slate-900">
                  {test.nombre}
                </span>
                <span className="mt-1 block text-slate-600">
                  {test.descripcion_breve || 'Sin descripción breve'}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {selected.enabled && tests.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">
          Este bloque no tiene exámenes activos disponibles.
        </p>
      )}
    </div>
  )
}

export default function LabReportBuilder({
  groups,
  testsByGroup,
  selection,
  onlyPriority,
  showReferenceRanges,
  loading,
  onToggleGroup,
  onToggleSelectAll,
  onToggleTest,
  onOnlyPriorityChange,
  onShowReferenceRangesChange,
  onGenerateReport,
}) {
  const selectedGroupsCount = Object.values(selection).filter(
    (item) => item.enabled,
  ).length

  return (
    <section className="mt-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Construir examen de laboratorio
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Selecciona uno o varios bloques, decide si quieres incluir todos
              los exámenes o solo algunos, y luego genera una hoja tipo reporte
              de laboratorio.
            </p>
          </div>

          <button
            type="button"
            onClick={onGenerateReport}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
              loading ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            Generar examen
          </button>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Filtros</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyPriority}
                  onChange={(event) => onOnlyPriorityChange(event.target.checked)}
                />
                Solo prioritarios
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showReferenceRanges}
                  onChange={(event) =>
                    onShowReferenceRangesChange(event.target.checked)
                  }
                />
                Mostrar rangos de referencia
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">Resumen</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>
                <span className="font-medium">Bloques seleccionados:</span>{' '}
                {selectedGroupsCount}
              </p>
              <p>
                <span className="font-medium">Filtro:</span>{' '}
                {onlyPriority ? 'Solo prioritarios' : 'Prioritarios y no prioritarios'}
              </p>
              <p>
                <span className="font-medium">Rangos:</span>{' '}
                {showReferenceRanges ? 'Visibles' : 'Ocultos'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">Uso recomendado</p>
            <p className="mt-3 text-sm text-slate-700">
              Combina bloques como Bioquímica, Gasometría y Perfil hepático para
              generar una hoja más parecida a un reporte real.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {groups.map((group) => (
            <BlockSelector
              key={group.id}
              group={group}
              tests={testsByGroup[group.id] ?? []}
              selected={
                selection[group.id] ?? {
                  enabled: false,
                  useAll: true,
                  testIds: [],
                }
              }
              onToggleGroup={onToggleGroup}
              onToggleSelectAll={onToggleSelectAll}
              onToggleTest={onToggleTest}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
