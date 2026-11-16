import { pageNumbers } from '../lib/paginate'

export default function Pagination({ page, pages, total, from, to, onPage, noun = 'results' }) {
  if (!total) return null
  const nums = pageNumbers(page, pages)

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Showing <strong className="text-navy">{from}–{to}</strong> of {total} {noun}
      </p>
      {pages > 1 && (
        <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
          <button type="button" className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Prev
          </button>
          {nums.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                className={`page-btn ${n === page ? 'is-current' : ''}`}
                aria-current={n === page ? 'page' : undefined}
                onClick={() => onPage(n)}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" className="page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Next
          </button>
        </nav>
      )}
    </div>
  )
}
