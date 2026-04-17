function TestChip({ test, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        selected
          ? 'bg-slate-900 text-white'
          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {test.nombre}
    </button>
  )
}

function BlockCard({
  group,
  tests,
  selected,
  onToggleGroup,
  onToggleExpanded,
  onToggleSelectAll,
  onToggleTest,
  onQuantityChange,
}) {
  const selectedCount = selected.useAll ? tests.length : selected.testIds.length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleGroup(group.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected.enabled
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {selected.enabled ? 'Bloque incluido' : 'Incluir bloque'}
            </button>
            <button
              type="button"
              onClick={() => onToggleExpanded(group.id)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {selected.expanded ? 'Ocultar exámenes' : 'Ver exámenes'}
            </button>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-slate-900">
            {group.nombre}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {group.descripcion || 'Sin descripción'}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">Disponibles:</span>{' '}
            {tests.length}
          </p>
          <p className="mt-1">
            <span className="font-medium text-slate-900">Seleccionados:</span>{' '}
            {selectedCount}
          </p>
        </div>
      </div>

      {selected.enabled && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Alcance del bloque</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleSelectAll(group.id, true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selected.useAll
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Todo el bloque
              </button>
              <button
                type="button"
                onClick={() => onToggleSelectAll(group.id, false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !selected.useAll
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Exámenes específicos
              </button>
            </div>
          </div>

          <label className="block text-sm text-slate-700">
            <span className="mb-2 block font-medium text-slate-900">
              Cantidad en este bloque
            </span>
            <input
              type="number"
              min="1"
              max={tests.length || 1}
              value={selected.quantity}
              onChange={(event) => onQuantityChange(group.id, event.target.value)}
              placeholder={`Máx. ${tests.length || 0}`}
              className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-slate-500"
            />
          </label>
        </div>
      )}

      {selected.expanded && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {tests.map((test) => (
              <TestChip
                key={test.id}
                test={test}
                selected={selected.useAll || selected.testIds.includes(test.id)}
                onClick={() => onToggleTest(group.id, test.id)}
              />
            ))}
          </div>

          {tests.length === 0 && (
            <p className="mt-4 text-sm text-slate-600">
              Este bloque no tiene exámenes disponibles con los filtros actuales.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function LabReportBuilder({
  groups,
  testsByGroup,
  selection,
  config,
  onToggleGroup,
  onToggleExpanded,
  onToggleSelectAll,
  onToggleTest,
  onQuantityChange,
  onConfigChange,
  onGenerateExam,
}) {
  const selectedGroups = Object.values(selection).filter((item) => item.enabled)
  const totalChosenTests = groups.reduce((sum, group) => {
    const current = selection[group.id]
    const tests = testsByGroup[group.id] ?? []

    if (!current?.enabled) return sum
    if (current.useAll) return sum + tests.length
    return sum + current.testIds.length
  }, 0)

  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Configuración del examen
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Examen por hoja de laboratorio
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Configura tus bloques, decide cuántas determinaciones incluir y
              genera una hoja tipo laboratorio real para responder analito por
              analito.
            </p>
          </div>

          <button
            type="button"
            onClick={onGenerateExam}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Ir al examen
          </button>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Contenido</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onConfigChange('onlyPriority', true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  config.onlyPriority
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Solo prioritarios
              </button>
              <button
                type="button"
                onClick={() => onConfigChange('onlyPriority', false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !config.onlyPriority
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Incluir no prioritarios
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">Formato</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onConfigChange('combineBlocks', true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  config.combineBlocks
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Hoja combinada
              </button>
              <button
                type="button"
                onClick={() => onConfigChange('combineBlocks', false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !config.combineBlocks
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Separar por bloque
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">Rangos</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onConfigChange('showReferenceRanges', true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  config.showReferenceRanges
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Mostrar rangos
              </button>
              <button
                type="button"
                onClick={() => onConfigChange('showReferenceRanges', false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !config.showReferenceRanges
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Ocultar rangos
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">Temporizador</p>
            <div className="mt-3">
              <select
                value={config.timerMinutes}
                onChange={(event) =>
                  onConfigChange('timerMinutes', event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-500"
              >
                <option value="0">Sin temporizador</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Preparado para activar un temporizador real más adelante.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Bloques activos</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {selectedGroups.length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              Determinaciones elegidas
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalChosenTests}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Salida esperada</p>
            <p className="mt-2 text-sm text-slate-600">
              {config.combineBlocks
                ? 'Una hoja amplia con varias secciones ordenadas por bloque.'
                : 'Bloques visualmente separados dentro del mismo examen.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <BlockCard
            key={group.id}
            group={group}
            tests={testsByGroup[group.id] ?? []}
            selected={
              selection[group.id] ?? {
                enabled: false,
                expanded: false,
                useAll: true,
                testIds: [],
                quantity: '',
              }
            }
            onToggleGroup={onToggleGroup}
            onToggleExpanded={onToggleExpanded}
            onToggleSelectAll={onToggleSelectAll}
            onToggleTest={onToggleTest}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </section>
  )
}
