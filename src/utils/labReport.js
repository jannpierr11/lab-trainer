import {
  explanationForAnswer,
  generatePracticeValue,
  labelAnswer,
  renderRange,
} from './practice'

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

function shuffleList(items) {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]]
  }

  return nextItems
}

function limitTests(items, quantity) {
  if (!quantity || quantity >= items.length) {
    return items
  }

  return shuffleList(items).slice(0, quantity)
}

export function buildReportSelection(groups) {
  return groups.reduce((accumulator, group) => {
    accumulator[group.id] = {
      enabled: false,
      expanded: false,
      useAll: true,
      testIds: [],
      quantity: '',
    }
    return accumulator
  }, {})
}

export function buildLabReportExam({
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

    const availableTests = testsByGroup[group.id] ?? []
    const pool = selected.useAll
      ? availableTests
      : availableTests.filter((test) => selected.testIds.includes(test.id))

    if (!pool.length) {
      continue
    }

    const requestedQuantity = Number(selected.quantity)
    const includedTests = limitTests(
      pool,
      Number.isFinite(requestedQuantity) && requestedQuantity > 0
        ? requestedQuantity
        : pool.length,
    )

    const entries = includedTests.map((test) => {
      const status = randomStatus()
      const recentValues = nextRecentValues[test.id] ?? []
      const value = generatePracticeValue(test, status, recentValues)

      nextRecentValues[test.id] = [value, ...recentValues].slice(0, 5)

      return {
        id: `${group.id}-${test.id}`,
        test,
        value,
        correctAnswer: status,
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

export function buildLabReportResults({ exam, answers, interpretationsByTest = {} }) {
  const rows = []
  const summaryByBlock = []
  let correctCount = 0

  for (const block of exam.blocks) {
    let blockCorrect = 0

    for (const entry of block.entries) {
      const userAnswer = answers[entry.id] ?? null
      const isCorrect = userAnswer === entry.correctAnswer

      if (isCorrect) {
        correctCount += 1
        blockCorrect += 1
      }

      rows.push({
        id: entry.id,
        blockName: block.group.nombre,
        testName: entry.test.nombre,
        value: entry.value,
        unit: entry.test.unidad || '—',
        userAnswer,
        correctAnswer: entry.correctAnswer,
        isCorrect,
        explanation: explanationForAnswer(
          interpretationsByTest[entry.test.id],
          entry.correctAnswer,
        ),
      })
    }

    summaryByBlock.push({
      groupId: block.group.id,
      groupName: block.group.nombre,
      total: block.entries.length,
      correct: blockCorrect,
      incorrect: block.entries.length - blockCorrect,
    })
  }

  const total = rows.length

  return {
    score: `${correctCount}/${total}`,
    correctCount,
    incorrectCount: total - correctCount,
    accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    total,
    summaryByBlock,
    rows: rows.map((row) => ({
      ...row,
      userAnswerLabel: row.userAnswer ? labelAnswer(row.userAnswer) : 'Sin responder',
      correctAnswerLabel: labelAnswer(row.correctAnswer),
    })),
  }
}
