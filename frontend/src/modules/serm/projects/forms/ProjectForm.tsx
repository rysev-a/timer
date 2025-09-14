import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import i18n from "@/core/i18n";
import { projectsTestConfig } from "@/modules/serm/tests/serm.e2e.config";

export default function ProjectForm() {
  const form = useFormContext();

  return (
    <>
      <div className="grid gap-2">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <Label htmlFor="name">{i18n.t("projectDetail.inputNameLabel")}</Label>

                <FormControl>
                  <Input
                    id="name"
                    type="text"
                    placeholder={i18n.t("projectDetail.inputNamePlaceholder")}
                    required
                    data-testid={projectsTestConfig.newProjectInputDescription}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{i18n.t("projectDetail.inputDescriptionLabel")}</Label>
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => {
            return (
              <Input
                id="description"
                type="text"
                placeholder={i18n.t("projectDetail.inputDescriptionPlaceholder")}
                required
                data-testid={projectsTestConfig.newProjectInputDescription}
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{i18n.t("projectDetail.inputSearchDeepLabel")}</Label>
        <FormField
          name="search_deep"
          control={form.control}
          render={({ field }) => {
            return (
              <Select defaultValue={String(field.value)} onValueChange={field.onChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder={i18n.t("projectDetail.inputSearchDeepPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{i18n.t("projectDetail.inputSearchDeepLabel")}</SelectLabel>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{i18n.t("projectDetail.inputCityLabel")}</Label>
        <FormField
          name="city"
          control={form.control}
          render={({ field }) => {
            return (
              <Select defaultValue={String(field.value)} onValueChange={field.onChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder={i18n.t("projectDetail.inputCityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{i18n.t("projectDetail.inputCityLabel")}</SelectLabel>
                    <SelectItem value="Москва">Москва</SelectItem>
                    <SelectItem value="Санкт-Петербург">Санкт-Петербург</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="key_words">{i18n.t("projectDetail.inputKeyWordsLabel")}</Label>
        <FormField
          name="key_words"
          control={form.control}
          render={({ field }) => {
            return (
              <Input
                id="key_words"
                type="text"
                placeholder={i18n.t("projectDetail.inputKeyWordsPlaceholder")}
                required
                data-testid={projectsTestConfig.newProjectInputDescription}
                value={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />
      </div>
    </>
  );
}
