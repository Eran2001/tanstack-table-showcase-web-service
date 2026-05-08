import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Employee } from "@/data/employees";
import { employees as data } from "@/data/employees";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableRowDetail } from "./DataTableRowDetail";

const statusVariants: Record<Employee["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  on_leave: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  terminated: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  probation: "bg-sky-500/15 text-sky-500 border-sky-500/30",
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function DataTable() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: ["select", "expander"], right: [] });
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: "select",
        size: 40,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        id: "expander",
        size: 36,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent"
            >
              {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null,
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 70,
        cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">#{getValue<number>()}</span>,
      },
      {
        accessorFn: (r) => `${r.firstName} ${r.lastName}`,
        id: "name",
        header: "Name",
        size: 180,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: "Department",
        size: 140,
        filterFn: (row, id, val: string[]) => (val?.length ? val.includes(row.getValue(id)) : true),
        enableGrouping: true,
        cell: ({ getValue }) => <span>{getValue<string>()}</span>,
        aggregatedCell: ({ row }) => (
          <Badge variant="secondary">{row.subRows.length} employees</Badge>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 180,
        enableGrouping: true,
      },
      {
        accessorKey: "salary",
        header: "Salary",
        size: 130,
        filterFn: (row, id, val: [number, number]) => {
          const v = row.getValue<number>(id);
          return v >= val[0] && v <= val[1];
        },
        aggregationFn: "mean",
        cell: ({ getValue }) => <span className="font-mono">{fmtCurrency(getValue<number>())}</span>,
        aggregatedCell: ({ getValue }) => (
          <span className="font-mono text-muted-foreground italic">
            avg {fmtCurrency(Math.round(getValue<number>()))}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        filterFn: (row, id, val: string[]) => (val?.length ? val.includes(row.getValue(id)) : true),
        cell: ({ getValue }) => {
          const s = getValue<Employee["status"]>();
          return (
            <Badge variant="outline" className={cn("capitalize", statusVariants[s])}>
              {s.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "performance",
        header: "Perf",
        size: 110,
        aggregationFn: "mean",
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full",
                    v > 75 ? "bg-emerald-500" : v > 50 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${v}%` }}
                />
              </div>
              <span className="text-xs tabular-nums">{v}</span>
            </div>
          );
        },
        aggregatedCell: ({ getValue }) => (
          <span className="text-xs italic text-muted-foreground">avg {Math.round(getValue<number>())}</span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start",
        size: 110,
        cell: ({ getValue }) => <span className="tabular-nums text-sm">{getValue<string>()}</span>,
      },
    ],
    []
  );

  const defaultColumnOrder = useMemo(() => columns.map((c) => c.id ?? (c as { accessorKey: string }).accessorKey), [columns]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder as string[]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting, columnFilters, globalFilter, pagination,
      rowSelection, columnVisibility, columnOrder, columnPinning,
      grouping, expanded,
    },
    enableMultiSort: true,
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getRowCanExpand: () => true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: "includesString",
  });

  const { rows } = table.getRowModel();

  // Virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 12,
  });

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setColumnOrder((prev) => {
      const oldIdx = prev.indexOf(active.id as string);
      const newIdx = prev.indexOf(over.id as string);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const headerGroups = table.getHeaderGroups();
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <DataTableToolbar
        table={table}
        grouping={grouping}
        setGrouping={(g) => setGrouping(g)}
        resetColumnVisibility={() => {
          setColumnVisibility({});
          setColumnOrder(defaultColumnOrder as string[]);
          setColumnPinning({ left: ["select", "expander"], right: [] });
        }}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div ref={tableContainerRef} className="relative max-h-[640px] overflow-auto">
          <table style={{ minWidth: table.getTotalSize() }} className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              {headerGroups.map((hg) => (
                <SortableContext
                  key={hg.id}
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  <tr>
                    {hg.headers.map((header) => (
                      <DataTableColumnHeader key={header.id} header={header} />
                    ))}
                  </tr>
                </SortableContext>
              ))}
            </thead>
            <tbody>
              {paddingTop > 0 && (
                <tr><td style={{ height: paddingTop }} colSpan={headerGroups[0].headers.length} /></tr>
              )}
              {virtualRows.map((vr) => {
                const row = rows[vr.index];
                const isSelected = row.getIsSelected();
                const isGrouped = row.getIsGrouped();
                return (
                  <Fragment key={row.id}>
                    <tr
                      data-index={vr.index}
                      ref={(el) => rowVirtualizer.measureElement(el)}
                      className={cn(
                        "border-b border-border/60 transition-colors",
                        vr.index % 2 === 1 && !isGrouped && "bg-muted/20",
                        "hover:bg-accent/40",
                        isSelected && "bg-primary/10 hover:bg-primary/15",
                        isGrouped && "bg-muted/60 font-medium"
                      )}
                      onClick={() => row.getCanExpand() && row.toggleExpanded()}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const pinned = cell.column.getIsPinned();
                        return (
                          <td
                            key={cell.id}
                            style={{
                              width: cell.column.getSize(),
                              position: pinned ? "sticky" : "relative",
                              left: pinned === "left" ? cell.column.getStart("left") : undefined,
                              right: pinned === "right" ? cell.column.getAfter("right") : undefined,
                              zIndex: pinned ? 5 : undefined,
                            }}
                            className={cn(
                              "px-2 py-2 align-middle whitespace-nowrap",
                              pinned && "bg-card",
                              isSelected && pinned && "bg-primary/10"
                            )}
                          >
                            {cell.getIsGrouped() ? (
                              <button
                                className="flex items-center gap-1 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  row.toggleExpanded();
                                }}
                              >
                                {row.getIsExpanded() ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                <Badge variant="secondary" className="ml-1">{row.subRows.length}</Badge>
                              </button>
                            ) : cell.getIsAggregated() ? (
                              flexRender(
                                cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            ) : cell.getIsPlaceholder() ? null : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {row.getIsExpanded() && !isGrouped && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length} className="bg-muted/10 p-0">
                          <DataTableRowDetail employee={row.original} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {paddingBottom > 0 && (
                <tr><td style={{ height: paddingBottom }} colSpan={headerGroups[0].headers.length} /></tr>
              )}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headerGroups[0].headers.length} className="text-center py-12 text-muted-foreground">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DndContext>

      <DataTablePagination table={table} />
    </div>
  );
}
