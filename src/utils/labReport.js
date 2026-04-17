import { generatePracticeValue, renderRange } from './practice'

const REPORT_STATUSES = ['bajo', 'normal', 'alto']

function randomStatus() {
  return REPORT_STATUSES[Math.floor(Math.random() * REPORT_STATUSES.length)]
}

function formatGeneratedAt(date = new Date()) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function buildReportSelection(groups) {
  return groups.reduce((accumulator, group) => {
    accumulator[group.id] = {
      enabled: false,
      useAll: true,
      testIds: [],
    }
    return accumulator
  }, {})
}

export function createLabReport({
  groups,
  testsByGroup,
  selection,
  recentValuesByTest = {},
}) {
  const nextRecentValues = { ...recentValuesByTest }
  const blocks = []

  for (const group of groups) {
    const selected = selection[group.id]

    if (!selected?.enabled) {
      continue
    }

    const groupTests = testsByGroup[group.id] ?? []
    const includedTests = selected.useAll
      ? groupTests
      : groupTests.filter((test) => selected.testIds.includes(test.id))

    if (!includedTests.length) {
      continue
    }

    const entries = includedTests.map((test) => {
      const status = randomStatus()
      const recentValues = nextRecentValues[test.id] ?? []
      const value = generatePracticeValue(test, status, recentValues)

      nextRecentValues[test.id] = [value, ...recentValues].slice(0, 5)

      return {
        test,
        value,
        status,
        statusLabel:
          status === 'normal'
            ? 'Dentro de rango'
            : status === 'bajo'
              ? 'Disminuido'
              : 'Elevado',
        referenceRange: renderRange(test),
      }
    })

    blocks.push({
      group,
      entries,
    })
  }

  return {
    blocks,
    totalEntries: blocks.reduce((sum, block) => sum + block.entries.length, 0),
    generatedAtLabel: formatGeneratedAt(),
    nextRecentValues,
  }
}
