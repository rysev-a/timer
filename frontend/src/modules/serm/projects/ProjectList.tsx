import { debounce } from "@tanstack/react-pacer";
import { useIsFetching, useMutation } from "@tanstack/react-query";
import { Link, type UseNavigateResult } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2Icon, PencilIcon, Trash2 } from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import TablePagination, {
  TablePaginationCounter,
} from "@/components/common/table/table-pagination";
import { Button } from "@/components/ui/button";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { httpClient } from "@/core/api";
import i18n from "@/core/i18n";
import { cn } from "@/lib/utils";
import { projectsTestConfig } from "../tests/serm.e2e.config";
import type { ProjectType } from "../types";

export interface SearchParams {
  name: string;
  description: string;
}

export interface ProjectListResponseData {
  total: number;
  count: number;
  items: ProjectType[];
}

export default function ProjectList({
  page,
  pageSize,
  searchParams,
  navigate,
  projects,
}: {
  page: number;
  pageSize: number;
  searchParams: SearchParams;
  projects: ProjectListResponseData;
  navigate: UseNavigateResult<"/projects">;
}) {
  const [filterParams, setFilterParams] = useState<SearchParams>({
    name: searchParams.name,
    description: searchParams.description,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize,
    });
    setFilterParams((state) => ({
      ...state,
      name: searchParams.name,
      description: searchParams.description,
    }));
  }, [page, pageSize, searchParams]);

  const search = useCallback(
    ({
      pageIndex,
      pageSize,
      searchParams,
    }: {
      pageIndex: number;
      pageSize: number;
      searchParams: SearchParams;
    }) => {
      return navigate({
        search: () => {
          return {
            page: pageIndex + 1,
            pageSize,
            name: searchParams.name,
            description: searchParams.description,
          };
        },
      });
    },
    [navigate],
  );

  const onPaginationChange = useCallback(
    (updater) => {
      const { pageIndex, pageSize } = updater(pagination);
      setPagination({
        pageIndex,
        pageSize,
      });

      return search({ pageIndex, pageSize, searchParams: filterParams });
    },
    [search, pagination, filterParams],
  );

  const debounceSearch = useCallback(
    debounce(search, {
      wait: 300,
    }),
    [],
  );

  const updateSearchName = useCallback(
    (e) => {
      setPagination((state) => ({
        ...state,
        pageIndex: 0,
      }));

      setFilterParams((state) => ({
        ...state,
        name: e.target.value,
      }));

      debounceSearch({
        pageIndex: 0,
        pageSize: pagination.pageSize,
        searchParams: {
          name: e.target.value,
          description: filterParams.description,
        },
      });
    },

    [debounceSearch, pagination, filterParams],
  );

  const updateSearchDescription = useCallback(
    (e) => {
      setPagination((state) => ({
        ...state,
        pageIndex: 0,
      }));

      setFilterParams((state) => ({
        ...state,
        description: e.target.value,
      }));

      debounceSearch({
        pageIndex: 0,
        pageSize: pagination.pageSize,
        searchParams: {
          description: e.target.value,
          name: filterParams.name,
        },
      });
    },

    [debounceSearch, pagination, filterParams],
  );

  const removeProjectQuery = useMutation({
    mutationFn: async (id: string) => await httpClient.delete(`/api/serm/projects/${id}`),
    onSuccess: () => {
      return onPaginationChange((state) => ({ ...state, page: 0 }));
    },
  });

  const isFetching = useIsFetching({ queryKey: ["projects"] });

  const columnHelper = createColumnHelper<ProjectType>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor("id", {
        header: () => <span>ID</span>,
        cell: (info) => info.getValue().slice(0, 8),
      }),
      columnHelper.accessor((row) => row.name, {
        id: "name",
        cell: (info) => info.getValue(),
        header: () => <span>{i18n.t("projectList.tableHeaderName")}</span>,
      }),
      columnHelper.accessor((row) => row.description, {
        id: "description",
        maxSize: 50,
        cell: (info) => info.getValue(),
        header: () => <span>{i18n.t("projectList.tableHeaderDescription")}</span>,
      }),
      columnHelper.accessor((row) => row.id, {
        header: () => <span>{i18n.t("projectList.tableHeaderActions")}</span>,
        id: "actions",
        cell: (info) => {
          return (
            <div className={"space-x-5"}>
              <Link to={"/projects/$id"} params={{ id: info.row.original.id }}>
                <Button size="icon" className="cursor-pointer" variant="secondary">
                  <PencilIcon />
                </Button>
              </Link>

              <Button
                size={"icon"}
                className={"cursor-pointer"}
                variant={"secondary"}
                data-testid={projectsTestConfig.projectTableItemDelete}
                onClick={() => {
                  removeProjectQuery.mutateAsync(info.row.original.id);
                }}
              >
                <Trash2 color={"red"} onClick={() => console.log("remove", info.getValue())} />
              </Button>
            </div>
          );
        },
      }),
    ];
  }, [columnHelper, removeProjectQuery]);

  const table = useReactTable({
    data: projects.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    rowCount: projects.total || 0,
    state: { pagination },
    onPaginationChange: onPaginationChange,
    initialState: {
      pagination: {
        pageIndex: 1,
        pageSize: 10,
      },
    },
  });

  const aside = useSidebar();

  return (
    <div
      className={cn("grid gap-4 items-start", {
        "grid-cols-1": aside.state === "expanded",
        "lg:grid-cols-6": aside.state === "collapsed",
      })}
    >
      <div className={"space-y-5"}>
        <div className={"flex items-center space-x-2"}>
          <h2 className={"text-2xl"}>{i18n.t("projectList.title")}</h2>
          <Loader2Icon
            className={cn("animate-spin opacity-0 transition-opacity duration-300", {
              "opacity-20": isFetching,
            })}
          />
        </div>

        <div className="overflow-hidden border-b border-t py-2">
          <h2 className={"py-3"}>Фильтры</h2>

          <form
            className={cn("grid gap-x-0 gap-y-4 relative pb-2", {
              "grid-cols-1 lg:grid-cols-4 lg:gap-x-4": aside.state === "expanded",
            })}
          >
            <FormItem>
              <Label>{i18n.t("projectList.filterProjectName")}</Label>
              <div className={"flex align-baseline relative"}>
                <Input
                  value={filterParams.name}
                  onChange={updateSearchName}
                  autoComplete={"off"}
                  placeholder={i18n.t("projectList.filterProjectNamePlaceholder")}
                  className={"w-full"}
                />
              </div>
            </FormItem>
            <FormItem>
              <Label>{i18n.t("projectList.filterProjectDescription")}</Label>

              <Input
                className={"w-full"}
                value={filterParams.description}
                onChange={updateSearchDescription}
                placeholder={i18n.t("projectList.filterProjectDescriptionPlaceholder")}
              />
            </FormItem>
          </form>
        </div>
      </div>

      {Boolean(projects.items.length > 0) && (
        <div className={"col-span-5"}>
          <div className="overflow-hidden rounded-md border">
            <Table
              className={cn("opacity-100 transition-opacity duration-300", {
                "opacity-20": isFetching,
              })}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => {
                  return (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  );
                })}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow key={row.id} data-testid={projectsTestConfig.projectTableItem}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            style={{
                              textWrap: "wrap",
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <div className={"flex"}>
                      <TablePagination table={table} />
                      <TablePaginationCounter
                        pageSize={pagination.pageSize}
                        onPaginationChange={onPaginationChange}
                        options={[5, 10, 20, 50, 100]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
      <div className={"buttons"}>
        <Link to={"/projects/new"}>
          <Button>{i18n.t("projectList.createLink")}</Button>
        </Link>
      </div>
    </div>
  );
}
