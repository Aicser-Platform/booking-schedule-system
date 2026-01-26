export type DemoRole = "admin" | "staff" | "customer";

export type DemoAccount = {
  role: DemoRole;
  label: string;
  email: string;
  password: string;
};

const DEMO_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEMO_ACCOUNTS_ENABLED !== "false";

const DEMO_AUTO_SUBMIT =
  process.env.NEXT_PUBLIC_DEMO_AUTO_SUBMIT === "true";

const demoAccounts: DemoAccount[] = [
  {
    role: "admin",
    label: "Login as Admin",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "admin@example.com",
    password:
      process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "Admin123!",
  },
  {
    role: "staff",
    label: "Login as Staff",
    email: process.env.NEXT_PUBLIC_DEMO_STAFF_EMAIL || "staff@example.com",
    password:
      process.env.NEXT_PUBLIC_DEMO_STAFF_PASSWORD || "Staff123!",
  },
  {
    role: "customer",
    label: "Login as Customer",
    email: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL || "customer@example.com",
    password:
      process.env.NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD || "Customer123!",
  },
].filter((account) => account.email && account.password);

export { DEMO_ENABLED, DEMO_AUTO_SUBMIT, demoAccounts };
