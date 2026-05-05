export type EmployeeStatus = "active" | "on_leave" | "terminated" | "probation";

export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  status: EmployeeStatus;
  startDate: string; // ISO
  performance: number; // 0-100
  isActive: boolean;
};

const firstNames = [
  "Alice","Bob","Charlie","Diana","Ethan","Fiona","George","Hannah","Ivan","Julia",
  "Kevin","Laura","Mike","Nina","Oscar","Paula","Quentin","Rachel","Sam","Tina",
  "Uma","Victor","Wendy","Xavier","Yara","Zach","Aaron","Bella","Carlos","Daisy",
];
const lastNames = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
];
const departments = ["Engineering","Marketing","Sales","HR","Finance","Design","Support","Operations"];
const rolesByDept: Record<string, string[]> = {
  Engineering: ["Frontend Engineer","Backend Engineer","DevOps","QA Engineer","Engineering Manager"],
  Marketing: ["Marketing Specialist","Content Strategist","SEO Lead","Marketing Manager"],
  Sales: ["Account Executive","SDR","Sales Manager","VP Sales"],
  HR: ["Recruiter","HR Generalist","People Ops Lead"],
  Finance: ["Accountant","Financial Analyst","Controller"],
  Design: ["Product Designer","UX Researcher","Design Lead"],
  Support: ["Support Agent","Support Lead","Customer Success"],
  Operations: ["Operations Analyst","Ops Manager","Project Manager"],
};
const statuses: EmployeeStatus[] = ["active","on_leave","terminated","probation"];

// Deterministic pseudo-random
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

export const employees: Employee[] = Array.from({ length: 200 }, (_, i) => {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const dept = pick(departments);
  const role = pick(rolesByDept[dept]);
  const status = pick(statuses);
  const salary = Math.round((40000 + rand() * 160000) / 1000) * 1000;
  const performance = Math.round(rand() * 100);
  const year = 2015 + Math.floor(rand() * 10);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  const startDate = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  return {
    id: i + 1,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@acme.io`,
    department: dept,
    role,
    salary,
    status,
    startDate,
    performance,
    isActive: status === "active",
  };
});
