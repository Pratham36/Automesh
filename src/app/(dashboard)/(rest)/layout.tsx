import { AppHeader } from "@/components/app-header";
import App from "next/app";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  );
};
export default Layout;
