import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/modules/auth/forms/ResetPasswordForm";

export const Route = createFileRoute("/auth/reset-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
