export default function PracticeSettings({
  practiceScope,
  practiceOnlyPriority,
  showRangesInPractice,
  practiceQuestion,
  selectedGroup,
  selectedTest,
  practicePoolCount,
  onPracticeScopeChange,
  onPracticeOnlyPriorityChange,
  onShowRangesChange,
  onStartPracticeForSelectedTest,
}) {
  return (
    <>
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
                onChange={() => onPracticeScopeChange('group')}
              />
              Grupo actual
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="practiceScope"
                value="all"
                checked={practiceScope === 'all'}
                onChange={() => onPracticeScopeChange('all')}
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
                onChange={() => onPracticeScopeChange('selected')}
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
                onChange={(event) =>
                  onPracticeOnlyPriorityChange(event.target.checked)
                }
              />
              Solo prioritarios
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showRangesInPractice}
                onChange={(event) => onShowRangesChange(event.target.checked)}
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
              {practicePoolCount} exámenes
            </p>
          </div>
        </div>
      </div>

      {selectedTest && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onStartPracticeForSelectedTest}
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
    </>
  )
}
