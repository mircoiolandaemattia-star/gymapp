function calorieBruciate(met, pesoKg, minuti) {
  return Math.round(met * 3.5 * pesoKg / 200 * minuti)
}

function bmr(h, w, a, s) {
  if (s === 'M') return Math.round(10 * w + 6.25 * h - 5 * a + 5)
  return Math.round(10 * w + 6.25 * h - 5 * a - 161)
}

function imc(pesoKg, altezzaCm) {
  const h = altezzaCm / 100
  return (pesoKg / (h * h)).toFixed(1)
}

export { calorieBruciate, bmr, imc }
