import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import auth from "@/core/auth";
import i18n from "@/core/i18n";
import { cn } from "@/lib/utils";
import { authE2eConfig } from "../tests/auth.e2e.config";

type StartResetPasswordFormValues = {
  email: string;
};

export function StartResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const form = useForm<StartResetPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  const submit = useCallback(
    (values: StartResetPasswordFormValues) => {
      auth
        .startResetPassword(values)
        .then(() => {
          navigate({ to: "/auth/reset-password" }).then(() => {
            toast.success(i18n.t("startResetPasswordForm.successMessage"));
          });
        })
        .catch((error) => {
          if (error.response.data?.detail) {
            if (error.response.data?.detail.includes("not found")) {
              form.setError("email", { message: "Not found" });
            }

            toast.error(i18n.t("startResetPasswordForm.resetErrorMessage"), {
              description: i18n.t("startResetPasswordForm.emailNotFound", { email: values.email }),
              action: {
                label: "Ok",
                onClick: () => {},
              },
            });
          } else {
            toast.error(i18n.t("startResetPasswordForm.resetUnknownErrorMessage"));
          }
        });
    },
    [navigate],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{i18n.t("startResetPasswordForm.title")}</CardTitle>
          <CardDescription>{i18n.t("startResetPasswordForm.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{i18n.t("startResetPasswordForm.emailLabel")}</Label>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            data-testid={authE2eConfig.startResetPasswordInput}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  data-testid={authE2eConfig.startResetPasswordButton}
                >
                  {i18n.t("startResetPasswordForm.submitButton")}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                {i18n.t("startResetPasswordForm.loginInvite")}{" "}
                <Link to={"/auth/login"} className="underline underline-offset-4">
                  {i18n.t("startResetPasswordForm.loginButton")}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
