import { useMemo, useState } from 'react'
import { estimateDuty } from '../lib/duty'
import { formatKes } from '../lib/format'
import { useCatalog } from '../context/Catalog'

export default function DutyBreakdown({ car, compact = false }) {
  const { site } = useCatalog()
  const [cifUsd, setCifUsd] = useState(car?.cifUsd || 25000)
  const [engineCc, setEngineCc] = useState(car?.engineCc || 1800)
  const [fuel, setFuel] = useState(car?.fuel || 'Petrol')
  const [body, setBody] = useState(car?.body || 'SUV')
  const [crspKes, setCrspKes] = useState(car?.crspKes || '')

  const estimate = useMemo(
    () =>
      estimateDuty({
        cifUsd,
        usdKes: site.usdKes,
        engineCc,
        fuel,
        body,
        crspKes: Number(crspKes) || 0,
      }),
    [cifUsd, engineCc, fuel, body, crspKes, site.usdKes],
  )

  return (
    <div className={compact ? '' : 'rounded-sm bg-white p-6 shadow-sm'}>
      {!compact && (
        <>
          <h2 className="font-display text-2xl text-navy">KES duty breakdown</h2>
          <p className="mt-2 text-sm text-muted">
            KRA taxes this on CRSP when published, otherwise CIF. IDF 3.5%, RDL 2%, VAT 16%. Final assessment is KRA’s.
            Rate on this desk: {site.usdKes} KES per USD.
          </p>
        </>
      )}
      <div className={`grid gap-3 ${compact ? 'mt-0' : 'mt-4'} sm:grid-cols-2`}>
        <label className="text-xs font-semibold tracking-widest uppercase">
          CIF USD
          <input className="field mt-1" type="number" value={cifUsd} onChange={(e) => setCifUsd(Number(e.target.value))} />
        </label>
        <label className="text-xs font-semibold tracking-widest uppercase">
          CRSP KES (optional)
          <input className="field mt-1" type="number" value={crspKes} onChange={(e) => setCrspKes(e.target.value)} placeholder="Leave blank to use CIF" />
        </label>
        <label className="text-xs font-semibold tracking-widest uppercase">
          Engine cc
          <input className="field mt-1" type="number" value={engineCc} onChange={(e) => setEngineCc(Number(e.target.value))} />
        </label>
        <label className="text-xs font-semibold tracking-widest uppercase">
          Fuel
          <select className="field mt-1" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Hybrid</option>
            <option>Electric</option>
          </select>
        </label>
      </div>
      <table className="mt-4 w-full text-sm">
        <tbody>
          {estimate.lines.map((line) => (
            <tr key={line.key} className="border-b border-cream">
              <th className="py-2 pr-3 text-left font-medium text-muted">{line.label}</th>
              <td className="py-2 text-right font-semibold text-navy">{formatKes(line.amount)}</td>
            </tr>
          ))}
          <tr>
            <th className="py-3 text-left font-display text-lg text-navy">Estimated landed</th>
            <td className="py-3 text-right font-display text-xl text-navy">{formatKes(estimate.landedKes)}</td>
          </tr>
        </tbody>
      </table>
      {car?.priceKes ? (
        <p className="mt-3 text-sm text-muted">
          Amason quote on this unit: <strong className="text-navy">{formatKes(car.priceKes)}</strong>. Difference covers
          rounding, a specific CRSP and the inland city you name.
        </p>
      ) : null}
    </div>
  )
}
