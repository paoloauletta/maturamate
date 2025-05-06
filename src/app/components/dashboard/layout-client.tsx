import dynamic from "next/dynamic";

// Dynamic imports for non-critical components
const DashboardSidebar = dynamic(() => import("./sidebar"));
const ThemeToggle = dynamic(
  () => import("./themeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);
