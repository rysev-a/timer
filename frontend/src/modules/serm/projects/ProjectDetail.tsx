import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosResponse } from "axios";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import ProjectForm from "@/modules/serm/projects/forms/ProjectForm";
import { projectsTestConfig } from "@/modules/serm/tests/serm.e2e.config";
import type { ProjectType } from "../types";

const ProjectDetailFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  search_deep: z.number(),
  city: z.string(),
  key_words: z.string(),
});

export default function ProjectDetail({ project }: { project: ProjectType }) {
  const queryClient = useQueryClient();

  const projectUpdateQuery = useMutation({
    mutationFn: async (data: ProjectType) =>
      await httpClient.patch(`/api/serm/projects/${data.id}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      }),
  });

  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description,
      search_deep: project.search_deep,
      city: project.city,
      key_words: project.key_words,
    },
  });

  const submit = useCallback(
    (values: z.infer<typeof ProjectDetailFormSchema>) => {
      return projectUpdateQuery
        .mutateAsync({
          id: values.id,
          name: values.name,
          description: values.description,
          search_deep: values.search_deep,
          city: values.city,
          key_words: values.key_words,
        })
        .then((response): AxiosResponse<ProjectType> => {
          toast.success(i18n.t("projectDetail.successMessage"));
          return response;
        })
        .catch(({ response }) => {
          if (response?.data?.detail === "Project already exists") {
            console.log("set name error");
            form.setError("name", { message: "Already exists" });

            toast.error(i18n.t("projectDetail.errorMessage"), {
              description: i18n.t("projectDetail.errorAlreadyExistMessage", {
                name: values.name,
              }),
            });
          } else {
            toast.error(i18n.t("projectDetail.errorMessage"));
          }

          throw new Error("Can't edit project");
        });
    },
    [projectUpdateQuery, form],
  );

  const submitAndEdit = useCallback(
    async (values: z.infer<typeof ProjectDetailFormSchema>) => {
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
    async (values: z.infer<typeof ProjectDetailFormSchema>) => {
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
