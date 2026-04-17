export default function GroupGrid({
  groups,
  loading,
  selectedGroup,
  onSelectGroup,
}) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold text-slate-900">Grupos</h2>

      {loading ? (
        <p className="mt-4 text-slate-700">Cargando grupos...</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectGroup(group)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${
                selectedGroup?.id === group.id
                  ? 'border-slate-900 bg-slate-100'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {group.nombre}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {group.descripcion || 'Sin descripción'}
              </p>
              <p className="mt-3 text-xs text-slate-400">slug: {group.slug}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
