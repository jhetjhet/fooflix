"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MediaPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MediaPagination({
  page,
  totalPages,
  onPageChange,
}: MediaPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(page - 1)}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* First page + leading ellipsis */}
        {page > 3 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">
                1
              </PaginationLink>
            </PaginationItem>
            {page > 4 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {/* Window of 5 pages around current */}
        {Array.from({ length: 5 }, (_, i) => {
          const p = page - 2 + i;
          if (p < 1 || p > totalPages) return null;
          return (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === page}
                onClick={() => onPageChange(p)}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Trailing ellipsis + last page */}
        {page < totalPages - 2 && (
          <>
            {page < totalPages - 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(page + 1)}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
