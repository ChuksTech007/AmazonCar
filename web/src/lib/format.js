import { SITE } from '../data/site'

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

export const usdToKes = (usd) => Math.round(usd * SITE.usdKes)

export const carTitle = (car) =>
  `${car.year} ${car.make} ${car.model}`

export const carFullTitle = (car) =>
  `${car.year} ${car.make} ${car.model} ${car.grade}`
