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
import type { AccountUser } from "@/package";
import { authE2eConfig } from "../tests/auth.e2e.config";

type FormValues = {
  email: string;
  password: string;
};

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submit = useCallback(
    (values: FormValues) => {
      auth
        .login(values)
        .then((user: AccountUser) => {
          if (user.is_active) {
            navigate({ to: "/" }).then(() => {
              toast.success(i18n.t("loginForm.successLogin"));
            });
          } else {
            toast.success(i18n.t("loginForm.userNotActive"), {
              description: i18n.t("loginForm.userNotActiveDescription"),
              action: {
                label: "Ok",
                onClick: () => {},
              },
            });
            navigate({ to: "/auth/reset-password" });
          }
        })
        .catch((error) => {
          if (error.response.data?.detail) {
            let description = i18n.t("loginForm.unknownLoginErrorMessage");

            if (error.response.data?.detail.includes("not found")) {
              form.setError("email", { message: "Not found" });
              description = i18n.t("loginForm.emailNotFound", { email: values.email });
            }

            if (error.response.data?.detail === "Invalid password") {
              form.setError("password", { message: "Invalid password" });
              description = i18n.t("loginForm.wrongPassword");
            }

            if (error.response.data?.detail === "User is disabled") {
              console.log("this case");
              description = i18n.t("loginForm.userIsDisabled");
            }

            toast.error(i18n.t("loginForm.loginErrorMessage"), {
              description,
              action: {
                label: "Ok",
                onClick: () => {},
              },
            });
          } else {
            toast.error(i18n.t("loginForm.unknownLoginErrorMessage"));
          }
        });
    },
    [navigate, form],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{i18n.t("loginForm.title")}</CardTitle>
          <CardDescription>{i18n.t("loginForm.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{i18n.t("loginForm.emailLabel")}</Label>

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
                            data-testid={authE2eConfig.loginInputEmail}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{i18n.t("loginForm.passwordLabel")}</Label>
                    <Link
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      to={"/auth/start-reset-password"}
                    >
                      {i18n.t("loginForm.forgotPassword")}
                    </Link>
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            data-testid={authE2eConfig.loginInputPassword}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid={authE2eConfig.loginSubmitButton}
                >
                  {i18n.t("loginForm.submitButton")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
