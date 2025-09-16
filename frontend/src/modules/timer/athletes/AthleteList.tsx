import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilIcon, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import type { AthleteType } from "@/modules/timer/types";

const columnHelper = createColumnHelper<AthleteType>();

export function AthleteList() {
  const athletesQuery = useQuery({
    queryFn: async () => (await httpClient.get("/api/timer/athletes")).data,
    queryKey: ["athletes"],
  });

  const queryClient = useQueryClient();

  const removeQuery = useMutation({
    mutationFn: async (id: string) => await httpClient.delete(`/api/timer/athletes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const removeItem = useCallback((id: string) => removeQuery.mutate(id), [removeQuery]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: "name",
        cell: (info) => info.getValue(),
        header: () => <span>{i18n.t("athleteList.headerName")}</span>,
        footer: (props) => props.column.id,
      }),
      {
        id: "buttons",

        cell: ({ row }) => {
          return (
            <div className="space-x-2">
              <Button size="icon" variant="secondary">
                <Link to={"/athletes/$id"} params={{ id: row.original.id }}>
                  <PencilIcon />
                </Link>
              </Button>
              <Button
                size="icon"
                variant={"destructive"}
                className={"cursor-pointer"}
                onClick={() => removeItem(row.original.id)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        },
      },
    ],
    [removeItem],
  );

  const table = useReactTable({
    data: athletesQuery?.data?.items || [],
    manualPagination: true,
    rowCount: athletesQuery?.data?.total || 0,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-start py-4">
        <Link to={"/athletes/new"}>
          <Button className={"cursor-pointer"}>
            {i18n.t("athleteList.createLink")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
