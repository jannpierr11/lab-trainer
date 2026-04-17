function ReportTable({ block, showReferenceRanges }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{block.group.nombre}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {block.group.descripcion || 'Bloque sin descripción'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-6 py-3 font-medium">Determinación</th>
              <th className="px-6 py-3 font-medium">Resultado</th>
              <th className="px-6 py-3 font-medium">Unidad</th>
              {showReferenceRanges && (
                <th className="px-6 py-3 font-medium">Valores de referencia</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {block.entries.map((entry) => (
              <tr key={entry.test.id} className="text-slate-700">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{entry.test.nombre}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.statusLabel}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      entry.status === 'normal'
                        ? 'bg-slate-100 text-slate-800'
                        : entry.status === 'bajo'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {entry.value}
                  </span>
                </td>
                <td className="px-6 py-4">{entry.test.unidad || '—'}</td>
                {showReferenceRanges && (
                  <td className="px-6 py-4 text-slate-600">{entry.referenceRange}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function LabReportView({
  report,
  showReferenceRanges,
  onBackToBuilder,
}) {
  if (!report) {
    return null
  }

  return (
    <section className="mt-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Hoja de laboratorio
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Reporte generado
            </h2>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Bloques:</span>{' '}
                {report.blocks.length}
              </p>
              <p>
                <span className="font-medium text-slate-900">Determinaciones:</span>{' '}
                {report.totalEntries}
              </p>
              <p>
                <span className="font-medium text-slate-900">Generado:</span>{' '}
                {report.generatedAtLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToBuilder}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Volver a configurar
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {report.blocks.map((block) => (
            <ReportTable
              key={block.group.id}
              block={block}
              showReferenceRanges={showReferenceRanges}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
