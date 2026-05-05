import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee } from "@/data/employees";

export function DataTablePagination({ table }: { table: Table<Employee> }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-2 py-3 border-t border-border">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> rows
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-[75px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          ><ChevronsLeft className="h-4 w-4" /></Button>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          ><ChevronLeft className="h-4 w-4" /></Button>

          <div className="flex items-center gap-1 px-2 text-sm">
            <span>Page</span>
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={pageIndex + 1}
              onChange={(e) => {
                const p = Number(e.target.value) - 1;
                if (!isNaN(p)) table.setPageIndex(Math.max(0, Math.min(p, table.getPageCount() - 1)));
              }}
              className="h-8 w-14 text-center"
            />
            <span className="text-muted-foreground">of {table.getPageCount()}</span>
          </div>

          <Button
            variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          ><ChevronRight className="h-4 w-4" /></Button>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          ><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
