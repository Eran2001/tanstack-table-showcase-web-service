import { flexRender, type Header } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EyeOff,
  PinOff,
  Pin,
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Employee } from "@/data/employees";

interface Props {
  header: Header<Employee, unknown>;
}

export function DataTableColumnHeader({ header }: Props) {
  const column = header.column;
  const canSort = column.getCanSort();
  const sorted = column.getIsSorted();
  const isPinned = column.getIsPinned();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: column.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.getSize(),
    opacity: isDragging ? 0.6 : 1,
    position: isPinned ? "sticky" : "relative",
    left: isPinned === "left" ? column.getStart("left") : undefined,
    right: isPinned === "right" ? column.getAfter("right") : undefined,
    zIndex: isPinned ? 20 : 10,
  };

  const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        "group h-10 px-2 text-left align-middle text-xs font-semibold text-muted-foreground border-b border-border bg-muted/60 backdrop-blur",
        isPinned && "bg-muted shadow-[inset_-1px_0_0_hsl(var(--border))]"
      )}
      colSpan={header.colSpan}
    >
      <div className="flex items-center gap-1">
        {column.id !== "select" && column.id !== "expander" && (
          <button
            className="cursor-grab opacity-40 hover:opacity-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          className={cn(
            "flex-1 select-none truncate",
            canSort && "cursor-pointer"
          )}
          onClick={canSort ? column.getToggleSortingHandler() : undefined}
        >
          {header.isPlaceholder
            ? null
            : flexRender(column.columnDef.header, header.getContext())}
        </div>

        {canSort && (
          <SortIcon
            className={cn(
              "h-3.5 w-3.5 transition-opacity",
              sorted ? "opacity-100 text-foreground" : "opacity-30"
            )}
          />
        )}

        {column.id !== "select" && column.id !== "expander" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                <span className="text-base leading-none">⋮</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => column.pin("left")}>
                <Pin className="mr-2 h-3.5 w-3.5" /> Pin left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.pin("right")}>
                <Pin className="mr-2 h-3.5 w-3.5" /> Pin right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.pin(false)}>
                <PinOff className="mr-2 h-3.5 w-3.5" /> Unpin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 h-3.5 w-3.5" /> Hide column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Resize handle */}
      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onDoubleClick={() => header.column.resetSize()}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-primary/40",
            header.column.getIsResizing() && "bg-primary"
          )}
        />
      )}
    </th>
  );
}
