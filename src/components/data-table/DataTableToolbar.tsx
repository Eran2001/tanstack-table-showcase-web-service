import type { Table } from "@tanstack/react-table";
import {
  Search,
  Settings2,
  Trash2,
  Download,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { Employee } from "@/data/employees";

interface Props {
  table: Table<Employee>;
  grouping: string[];
  setGrouping: (g: string[]) => void;
  resetColumnVisibility: () => void;
}

export function DataTableToolbar({ table, grouping, setGrouping, resetColumnVisibility }: Props) {
  const selectedCount = table.getSelectedRowModel().rows.length;
  const activeFilterCount =
    table.getState().columnFilters.length + (table.getState().globalFilter ? 1 : 0);

  // Faceted dept counts
  const deptCol = table.getColumn("department");
  const statusCol = table.getColumn("status");
  const salaryCol = table.getColumn("salary");

  const deptFacets = deptCol?.getFacetedUniqueValues();
  const statusFacets = statusCol?.getFacetedUniqueValues();

  const salaryFilter = (salaryCol?.getFilterValue() as [number, number] | undefined) ?? [40000, 200000];

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-card/40">
      {/* Global search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search all columns…"
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="pl-8 h-9 w-[220px]"
        />
      </div>

      {/* Department filter (faceted) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-dashed">
            Department
            {(deptCol?.getFilterValue() as string[] | undefined)?.length ? (
              <Badge variant="secondary" className="ml-2">
                {(deptCol?.getFilterValue() as string[]).length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <div className="text-xs font-medium text-muted-foreground px-1 pb-1">Filter by department</div>
          <div className="space-y-1 max-h-64 overflow-auto">
            {deptFacets &&
              Array.from(deptFacets.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([value, count]) => {
                  const current = (deptCol?.getFilterValue() as string[] | undefined) ?? [];
                  const checked = current.includes(value as string);
                  return (
                    <label
                      key={value as string}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = v
                            ? [...current, value as string]
                            : current.filter((c) => c !== value);
                          deptCol?.setFilterValue(next.length ? next : undefined);
                        }}
                      />
                      <span className="flex-1">{value as string}</span>
                      <span className="text-xs text-muted-foreground">({count})</span>
                    </label>
                  );
                })}
          </div>
          {(deptCol?.getFilterValue() as string[] | undefined)?.length ? (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => deptCol?.setFilterValue(undefined)}
              >
                Clear
              </Button>
            </>
          ) : null}
        </PopoverContent>
      </Popover>

      {/* Status filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-dashed">
            Status
            {(statusCol?.getFilterValue() as string[] | undefined)?.length ? (
              <Badge variant="secondary" className="ml-2">
                {(statusCol?.getFilterValue() as string[]).length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <div className="space-y-1">
            {statusFacets &&
              Array.from(statusFacets.entries()).map(([value, count]) => {
                const current = (statusCol?.getFilterValue() as string[] | undefined) ?? [];
                const checked = current.includes(value as string);
                return (
                  <label
                    key={value as string}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer text-sm capitalize"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const next = v
                          ? [...current, value as string]
                          : current.filter((c) => c !== value);
                        statusCol?.setFilterValue(next.length ? next : undefined);
                      }}
                    />
                    <span className="flex-1">{(value as string).replace("_"," ")}</span>
                    <span className="text-xs text-muted-foreground">({count})</span>
                  </label>
                );
              })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Salary range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-dashed">
            Salary
            {salaryCol?.getFilterValue() ? <Badge variant="secondary" className="ml-2">1</Badge> : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4">
          <div className="text-xs text-muted-foreground mb-2">
            ${salaryFilter[0].toLocaleString()} – ${salaryFilter[1].toLocaleString()}
          </div>
          <Slider
            min={40000}
            max={200000}
            step={1000}
            value={salaryFilter}
            onValueChange={(v) => salaryCol?.setFilterValue(v as [number, number])}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => salaryCol?.setFilterValue(undefined)}
          >
            Reset
          </Button>
        </PopoverContent>
      </Popover>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => {
            table.resetColumnFilters();
            table.setGlobalFilter("");
          }}
        >
          Clear filters <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
        </Button>
      )}

      <div className="flex-1" />

      {/* Grouping */}
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <Select
          value={grouping[0] ?? "none"}
          onValueChange={(v) => setGrouping(v === "none" ? [] : [v])}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No grouping</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="role">Role</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Column visibility */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Settings2 className="h-4 w-4 mr-2" /> Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllLeafColumns()
            .filter((c) => c.getCanHide())
            .map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={c.getIsVisible()}
                onCheckedChange={(v) => c.toggleVisibility(!!v)}
                className="capitalize"
              >
                {c.id}
              </DropdownMenuCheckboxItem>
            ))}
          <DropdownMenuSeparator />
          <button
            onClick={resetColumnVisibility}
            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reset columns
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button variant="ghost" size="sm" className="h-7">
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}
