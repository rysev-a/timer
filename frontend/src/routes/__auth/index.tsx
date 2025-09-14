import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import i18n from "@/core/i18n";

export const Route = createFileRoute("/__auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="m-10">
      <h1 className="text-4xl">Developers collaborative project</h1>
      <p className="py-5 text-gray-500">Recent projects</p>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Super project</CardTitle>
          <CardDescription>Project description</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="submit" className="cursor-pointer" size={"sm"}>
            {i18n.t("joinToProject")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
