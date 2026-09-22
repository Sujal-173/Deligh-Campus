import LeftSidebar, { type SidebarVariant } from "./LeftSidebar";
import AuthCard from "./AuthCard";

export default function AuthLayout({
  children,
  variant = "generic",
}: {
  children: React.ReactNode;
  variant?: SidebarVariant;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-grey-5 p-4 lg:p-8">
      <div className="flex w-full max-w-5xl gap-6">
        <LeftSidebar variant={variant} />
        <AuthCard>{children}</AuthCard>
      </div>
    </main>
  );
}
