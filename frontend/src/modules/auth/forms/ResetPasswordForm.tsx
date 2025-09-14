import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import auth from "@/core/auth";
import i18n from "@/core/i18n";
import { cn } from "@/lib/utils";
import { authE2eConfig } from "../tests/auth.e2e.config";

type ResetPasswordFormValues = {
  code: string;
  password: string;
};

const ResetPasswordFormSchema = z.object({
  code: z.string(),
  password: z.string().min(8, { message: i18n.t("resetPasswordForm.passwordToSmall") }),
});

export function ResetPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      code: "",
      password: "",
    },
  });

  const submit = useCallback(
    (values: ResetPasswordFormValues) => {
      auth
        .resetPassword(values)
        .then(() => {
          navigate({ to: "/" }).then(() => {
            toast.success("resetPasswordForm.resetPasswordSuccess");
          });
        })
        .catch((error) => {
          if (error.response.data?.detail) {
            const detail = error.response.data?.detail;

            form.setError("code", { message: "Not found" });

            if (detail === "Auth code not found") {
              toast.error(i18n.t("resetPasswordForm.resetPasswordError"), {
                description: i18n.t("resetPasswordForm.authCodeNotFoundError"),
                action: {
                  label: "Ok",
                  onClick: () => {},
                },
              });
              return;
            }

            if (detail === "Auth code wrong or expired") {
              toast.error(i18n.t("resetPasswordForm.resetPasswordError"), {
                description: i18n.t("resetPasswordForm.authCodeInvalidError"),
                action: {
                  label: "Ok",
                  onClick: () => {},
                },
              });
              return;
            }

            toast.error(`can't reset password, unknown error`);
          }
        });
    },
    [navigate, form.setError],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{i18n.t("resetPasswordForm.title")}</CardTitle>
          <CardDescription>{i18n.t("resetPasswordForm.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{i18n.t("resetPasswordForm.codeLabel")}</Label>
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            id="code"
                            type="text"
                            placeholder="00000000"
                            required
                            data-testid={authE2eConfig.resetPasswordCodeInput}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{i18n.t("resetPasswordForm.passwordLabel")}</Label>
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className={"relative"}>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            required
                            data-testid={authE2eConfig.resetPasswordInput}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  data-testid={authE2eConfig.resetPasswordButton}
                >
                  {i18n.t("resetPasswordForm.submitButton")}
                </Button>
                <div className="mt-4 text-center text-sm">
                  {i18n.t("resetPasswordForm.loginInvite")}{" "}
                  <Link to={"/auth/login"} className="underline underline-offset-4">
                    {i18n.t("resetPasswordForm.loginButton")}
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
