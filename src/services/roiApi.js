function round2(n) {
  return Math.round(n * 100) / 100
}

export function calculateRoi(inputs) {
  const {
    numberOfOutlets,
    dailyTransactions,
    transactionValue,
    currentCost,
    staffCount,
    hoursPerDay,
  } = inputs

  const monthlyRevenue = round2(dailyTransactions * transactionValue * 30 * numberOfOutlets)
  const errorSavings   = round2(monthlyRevenue * 0.02)
  const timeSavings    = round2(hoursPerDay * staffCount * 30 * 25)
  const smartouchCost  = round2(numberOfOutlets * 299)
  const netSavings     = round2(errorSavings + timeSavings - (smartouchCost - currentCost))
  const annualSavings  = round2(netSavings * 12)
  const roi            = smartouchCost > 0 ? round2((annualSavings / (smartouchCost * 12)) * 100) : 0
  const paybackMonths  = netSavings > 0 ? round2(smartouchCost / netSavings) : -1

  return { monthlyRevenue, errorSavings, timeSavings, smartouchCost, netSavings, annualSavings, roi, paybackMonths }
}
