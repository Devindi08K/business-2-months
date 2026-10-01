import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-sm text-slate-600">Loading…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
