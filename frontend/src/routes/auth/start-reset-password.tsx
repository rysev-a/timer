import { createFileRoute } from "@tanstack/react-router";
import { StartResetPasswordForm } from "@/modules/auth/forms/StartResetPasswordForm";

export const Route = createFileRoute("/auth/start-reset-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <StartResetPasswordForm />
      </div>
    </div>
  );
}
