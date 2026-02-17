export type DemoRole = "admin" | "staff" | "customer";

export type DemoAccount = {
  role: DemoRole;
  label: string;
  email: string;
  password: string;
};

const DEMO_AUTO_SUBMIT =
  process.env.NEXT_PUBLIC_DEMO_AUTO_SUBMIT === "true";

const demoAccounts: DemoAccount[] = [
  {
    role: "admin",
    label: "Login as Admin",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "",
  },
  {
    role: "staff",
    label: "Login as Staff",
    email: process.env.NEXT_PUBLIC_DEMO_STAFF_EMAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_STAFF_PASSWORD || "",
  },
  {
    role: "customer",
    label: "Login as Customer",
    email: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD || "",
  },
].filter((account) => account.email && account.password);

const DEMO_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEMO_ACCOUNTS_ENABLED === "true" &&
  demoAccounts.length > 0;

export { DEMO_ENABLED, DEMO_AUTO_SUBMIT, demoAccounts };
