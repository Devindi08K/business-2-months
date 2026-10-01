export const dynamic = "force-dynamic";

import { ToastProvider } from "@/components/ui/Toast";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
