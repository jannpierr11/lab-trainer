const MODES = [
  { id: 'practice', label: 'Práctica rápida' },
  { id: 'lab-report', label: 'Examen por hoja' },
  { id: 'progress', label: 'Progreso' },
]

export default function MainModeTabs({ activeMode, onChange }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeMode === mode.id
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
