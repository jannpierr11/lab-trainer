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

export function generateValue(test, type) {
  const { min, max } = getRange(test)
  const span = max - min

  if (type === 'normal') {
    const value = min + Math.random() * span
    return roundSmart(value)
  }

  const offset = span > 1 ? span * 0.3 : Math.max(span * 0.5, 0.1)

  if (type === 'bajo') {
    return roundSmart(min - offset)
  }

  return roundSmart(max + offset)
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
