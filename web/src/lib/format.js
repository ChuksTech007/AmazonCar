import { SITE } from '../data/site'

let usdKesRate = SITE.usdKes

export const setUsdKes = (n) => {
  usdKesRate = Number(n) || SITE.usdKes
}

export const formatKes = (n) =>
  `KES ${Number(n).toLocaleString('en-KE')}`

export const formatUsd = (n) =>
  `US$ ${Number(n).toLocaleString('en-US')}`

export const formatYen = (n) =>
  `¥${Number(n).toLocaleString('ja-JP')}`

export const formatKm = (n) =>
  `${Number(n).toLocaleString('en-KE')} km`

export const formatCc = (n) =>
  `${Number(n).toLocaleString('en-KE')} cc`

export const usdToKes = (usd, rate = usdKesRate) => Math.round(usd * rate)

export const carTitle = (car) =>
  `${car.year} ${car.make} ${car.model}`

export const carFullTitle = (car) =>
  `${car.year} ${car.make} ${car.model} ${car.grade}`
