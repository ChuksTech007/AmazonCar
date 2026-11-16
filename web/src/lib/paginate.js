export function paginate(items, page, pageSize) {
  const rows = Array.isArray(items) ? items : []
  const total = rows.length
  const size = Math.max(1, Number(pageSize) || 10)
  const pages = Math.max(1, Math.ceil(total / size) || 1)
  const current = Math.min(Math.max(1, Number(page) || 1), pages)
  const start = (current - 1) * size
  return {
    slice: rows.slice(start, start + size),
    page: current,
    pages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + size, total),
    pageSize: size,
  }
}

export function pageNumbers(page, pages, windowSize = 1) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const set = new Set([1, pages, page])
  for (let i = 1; i <= windowSize; i += 1) {
    set.add(page - i)
    set.add(page + i)
  }
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < nums.length; i += 1) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) out.push('…')
    out.push(nums[i])
  }
  return out
}
