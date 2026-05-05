import { DataTable } from "@/components/data-table/DataTable";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Table2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center">
              <Table2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold leading-tight">TanStack Table v8 — Showcase</h1>
              <p className="text-xs text-muted-foreground">Every feature, in one table.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">200 employees</Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container py-6">
        <DataTable />
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Tip: hold <kbd className="px-1 py-0.5 rounded bg-muted">Shift</kbd> + click headers to multi-sort.
          Drag column headers to reorder. Right column ⋮ menu pins / hides.
        </p>
      </main>
    </div>
  );
};

export default Index;
