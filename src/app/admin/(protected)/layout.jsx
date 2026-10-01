import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      user={{
        name: session.name,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
