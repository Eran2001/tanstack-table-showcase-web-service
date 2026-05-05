import type { Employee } from "@/data/employees";
import { Card } from "@/components/ui/card";

export function DataTableRowDetail({ employee }: { employee: Employee }) {
  return (
    <Card className="m-2 p-4 bg-muted/30">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Full Name</div>
          <div className="font-medium">{employee.firstName} {employee.lastName}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Email</div>
          <div className="font-medium truncate">{employee.email}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Department</div>
          <div className="font-medium">{employee.department}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Role</div>
          <div className="font-medium">{employee.role}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Salary</div>
          <div className="font-medium">${employee.salary.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Status</div>
          <div className="font-medium capitalize">{employee.status.replace("_"," ")}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Start Date</div>
          <div className="font-medium">{employee.startDate}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Performance</div>
          <div className="font-medium">{employee.performance}/100</div>
        </div>
      </div>
    </Card>
  );
}
