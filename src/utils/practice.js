export function getRange(test) {
  if (test.depende_sexo) {
    const min = Number(test.valor_min_ref_m)
    const max = Number(test.valor_max_ref_m)

    return {
      min,
      max,
      label: `M: ${test.valor_min_ref_m ?? '-'}-${test.valor_max_ref_m ?? '-'} | F: ${test.valor_min_ref_f ?? '-'}-${test.valor_max_ref_f ?? '-'}`,
    }
  }

  const min = Number(test.valor_min_ref)
  const max = Number(test.valor_max_ref)

  return {
    min,
    max,
    label: `${min}-${max}`,
  }
}

export function renderRange(test) {
  return getRange(test).label
}

export function roundSmart(value) {
  if (Number.isNaN(value)) return value
  if (Math.abs(value) >= 10) return Math.round(value * 10) / 10
  return Math.round(value * 100) / 100
}

function countDecimals(value) {
  if (value === null || value === undefined || value === '') return 0

  const text = String(value)

  if (!text.includes('.')) {
    return 0
  }

  return text.split('.')[1].length
}

function getReferenceDecimals(test) {
  return Math.max(
    countDecimals(test.valor_min_ref),
    countDecimals(test.valor_max_ref),
    countDecimals(test.valor_min_ref_m),
    countDecimals(test.valor_max_ref_m),
    countDecimals(test.valor_min_ref_f),
    countDecimals(test.valor_max_ref_f),
  )
}

function getValuePrecision(test, min, max) {
  const explicitDecimals = getReferenceDecimals(test)
  const span = Math.abs(max - min)

  if (explicitDecimals >= 2) return 2
  if (explicitDecimals === 1) return 1
  if (span <= 1) return 2
  if (span <= 20) return 1
  return 0
}

function roundToPrecision(value, precision) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export function generateValue(test, type) {
  const { min, max } = getRange(test)
  const span = max - min
  const safeSpan = span > 0 ? span : Math.max(Math.abs(max || min), 1)
  const precision = getValuePrecision(test, min, max)

  if (type === 'normal') {
    const innerMargin = safeSpan * 0.05
    const start = min + innerMargin
    const end = max - innerMargin
    const lowerBound = start < end ? start : min
    const upperBound = start < end ? end : max
    return roundToPrecision(randomBetween(lowerBound, upperBound), precision)
  }

  if (type === 'bajo') {
    const lowerOffset = Math.max(safeSpan * 0.15, 10 ** -precision)
    const upperOffset = Math.max(safeSpan * 0.75, lowerOffset * 2)
    return roundToPrecision(
      min - randomBetween(lowerOffset, upperOffset),
      precision,
    )
  }

  const lowerOffset = Math.max(safeSpan * 0.15, 10 ** -precision)
  const upperOffset = Math.max(safeSpan * 0.75, lowerOffset * 2)
  return roundToPrecision(
    max + randomBetween(lowerOffset, upperOffset),
    precision,
  )
}

export function generatePracticeValue(test, type, recentValues = []) {
  const normalizedRecentValues = recentValues.map((value) => Number(value))

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generateValue(test, type)

    if (!normalizedRecentValues.includes(Number(candidate))) {
      return candidate
    }
  }

  return generateValue(test, type)
}

export function explanationForAnswer(detail, answer) {
  if (!detail) return 'No registrado'
  if (answer === 'bajo') return detail.si_bajo || 'No registrado'
  if (answer === 'normal') return detail.si_normal || 'No registrado'
  return detail.si_alto || 'No registrado'
}

export function labelAnswer(answer) {
  if (answer === 'bajo') return 'Bajo'
  if (answer === 'normal') return 'Normal'
  if (answer === 'alto') return 'Alto'
  return answer
}

export function formatStoredAnswer(estado, direccion) {
  if (estado === 'normal') return 'Normal'
  if (estado === 'alterado' && direccion === 'bajo') return 'Bajo'
  if (estado === 'alterado' && direccion === 'alto') return 'Alto'
  return 'No registrado'
}

export function formatAnsweredAt(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
