import { Button } from "./button"

export function Pagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <Button  variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        Prev
      </Button>
      <span className="text-sm">
        Page {page} of {pageCount}
      </span>
      <Button  variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>
        Next
      </Button>
    </div>
  )
}
