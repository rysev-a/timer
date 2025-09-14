import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosResponse } from "axios";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import ProjectForm from "@/modules/serm/projects/forms/ProjectForm";
import { projectsTestConfig } from "@/modules/serm/tests/serm.e2e.config";
import type { ProjectType } from "../types";

const CreateProjectFormSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export default function ProjectCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createProjectQuery = useMutation({
    mutationFn: (data: Partial<Omit<ProjectType, "id">>) => {
      return httpClient.post("/api/serm/projects/", data);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof CreateProjectFormSchema>) => {
      return createProjectQuery
        .mutateAsync({
          name: values.name,
          description: values.description,
        })
        .then((response): AxiosResponse<ProjectType> => {
          toast.success(i18n.t("projectCreate.createProjectSuccess"));
          return response;
        })
        .catch(({ response }) => {
          if (response.data.detail === "Project already exists") {
            toast.error(i18n.t("projectCreate.createProjectError"), {
              description: i18n.t("projectCreate.projectAlreadyExistsError", { name: values.name }),
            });
            form.setError("name", { message: response.data.detail });
          } else {
            toast.error(i18n.t("projectCreate.createProjectError"));
          }

          throw new Error("Can't create project");
        });
    },
    [createProjectQuery, form],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof CreateProjectFormSchema>) => {
      const response = await submit(values);
      if (response?.data.id) {
        return await navigate({
          to: "/projects/$id",
          params: { id: response?.data.id as string },
        });
      }
    },
    [submit, navigate],
  );

  const submitAndNavigate = useCallback(
    async (values: z.infer<typeof CreateProjectFormSchema>) => {
      await submit(values);
      return await navigate({
        to: "/projects",
        search: { page: 1, pageSize: 10, name: "", description: "" },
      });
    },
    [submit, navigate],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAndEdit)}>
        <div className="flex flex-col gap-6">
          <ProjectForm />
          <div className={"space-x-5"}>
            <Button type="submit" className={"cursor-pointer"}>
              {i18n.t("buttons.saveAndEdit")}
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(submitAndNavigate)}
              data-testid={projectsTestConfig.submitButton}
              className={"cursor-pointer"}
            >
              {i18n.t("buttons.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
