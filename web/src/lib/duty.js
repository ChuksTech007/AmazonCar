const DUTY_RATE = 0.25
const IDF_RATE = 0.035
const RDL_RATE = 0.02
const VAT_RATE = 0.16

export function exciseRate({ engineCc = 0, fuel = 'Petrol', body = '' } = {}) {
  if (String(fuel).toLowerCase() === 'electric') return 0.1
  if (String(body).toLowerCase() === 'pickup') return 0.25
  const cc = Number(engineCc) || 0
  if (cc <= 1500) return 0.2
  if (cc <= 3000) return 0.25
  return 0.35
}

export function estimateDuty({
  cifUsd = 0,
  usdKes = 129,
  engineCc = 1800,
  fuel = 'Petrol',
  body = 'SUV',
  crspKes = 0,
  inlandKes = 65000,
  portKes = 55000,
} = {}) {
  const cifKes = Math.round(Number(cifUsd || 0) * Number(usdKes || 129))
  const crsp = Math.round(Number(crspKes) || 0)
  const customsKes = crsp > 0 ? Math.max(cifKes, crsp) : cifKes
  const basis = crsp > 0 && crsp >= cifKes ? 'CRSP' : 'CIF'
  const excisePct = exciseRate({ engineCc, fuel, body })
  const importDuty = Math.round(customsKes * DUTY_RATE)
  const excise = Math.round(customsKes * excisePct)
  const vat = Math.round((customsKes + importDuty + excise) * VAT_RATE)
  const idf = Math.round(customsKes * IDF_RATE)
  const rdl = Math.round(customsKes * RDL_RATE)
  const port = Math.round(Number(portKes) || 0)
  const inland = Math.round(Number(inlandKes) || 0)
  const taxes = importDuty + excise + vat + idf + rdl
  const landedKes = customsKes === 0 ? 0 : cifKes + taxes + port + inland
  return {
    cifKes,
    crspKes: crsp,
    customsKes,
    basis,
    usdKes: Number(usdKes) || 129,
    rates: {
      importDuty: DUTY_RATE,
      excise: excisePct,
      vat: VAT_RATE,
      idf: IDF_RATE,
      rdl: RDL_RATE,
    },
    lines: [
      { key: 'cif', label: `CIF Mombasa (${basis === 'CRSP' ? 'invoice' : 'taxable'})`, amount: cifKes },
      { key: 'customs', label: `Customs value (${basis})`, amount: customsKes },
      { key: 'duty', label: `Import duty (${Math.round(DUTY_RATE * 100)}%)`, amount: importDuty },
      { key: 'excise', label: `Excise (${Math.round(excisePct * 100)}%)`, amount: excise },
      { key: 'vat', label: `VAT (${Math.round(VAT_RATE * 100)}% of value + duty + excise)`, amount: vat },
      { key: 'idf', label: `IDF (${(IDF_RATE * 100).toFixed(1)}%)`, amount: idf },
      { key: 'rdl', label: `Railway Development Levy (${Math.round(RDL_RATE * 100)}%)`, amount: rdl },
      { key: 'port', label: 'Port / KEBS estimate', amount: port },
      { key: 'inland', label: 'Inland delivery estimate', amount: inland },
    ],
    taxes,
    port,
    inland,
    landedKes,
  }
}
