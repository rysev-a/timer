import type { Table } from "@tanstack/react-table";

import { clsx } from "clsx";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { range } from "rambda";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
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

const preparePagination = (pages: number[], currentPage: number): number[] => {
  if (pages.length < 13) {
    return pages;
  }

  if (currentPage < 6 || pages.length - currentPage < 5) {
    return [...range(1)(7), -1, ...range(pages.length - 5)(pages.length + 1)];
  }

  return [
    ...range(1)(4),
    -1,
    ...range(currentPage - 1)(currentPage + 2),
    -2,
    ...range(pages.length - 2)(pages.length + 1),
  ];
};

const TablePagination = <TableModel,>({ table }: { table: Table<TableModel> }) => {
  const pageSize = table.getState().pagination.pageSize;

  const pages = preparePagination(
    range(1)(Math.ceil(table.getRowCount() / pageSize) + 1),
    table.getState().pagination.pageIndex + 1,
  );

  if (pages.length < 2) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            size="default"
            onClick={() => table.getCanPreviousPage() && table.previousPage()}
            className={clsx(
              {
                "cursor-pointer": table.getCanPreviousPage(),
                "opacity-20 cursor-not-allowed": !table.getCanPreviousPage(),
              },
              "select-none gap-1 px-2.5 sm:pl-2.5",
            )}
          >
            <ChevronLeftIcon />
            <span className="hidden sm:block">{i18n.t("pagination.previous")}</span>
          </PaginationLink>
        </PaginationItem>
        {pages.map((page) => {
          if (page < 0) {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                className={clsx(
                  {
                    "cursor-pointer": table.getState().pagination.pageIndex + 1 !== page,
                  },
                  "select-none",
                )}
                onClick={() =>
                  table.setPagination({
                    pageIndex: page - 1,
                    pageSize: pageSize,
                  })
                }
                key={page}
                isActive={table.getState().pagination.pageIndex + 1 === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationLink
            size="default"
            onClick={() => table.getCanNextPage() && table.nextPage()}
            className={clsx(
              {
                "cursor-pointer": table.getCanNextPage(),
                "opacity-20 cursor-not-allowed": !table.getCanNextPage(),
              },
              "select-none gap-1 px-2.5 sm:pl-2.5",
            )}
          >
            <span className="hidden sm:block">{i18n.t("pagination.next")}</span>
            <ChevronRightIcon />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export interface TablePaginationCounterProps {
  onPaginationChange: (updater: any) => Promise<void>;
  options: number[];
  pageSize: number;
}

export const TablePaginationCounter = (props: TablePaginationCounterProps) => {
  return (
    <div className={"flex items-center space-x-2"}>
      <p className="text-sm font-medium">{i18n.t("pagination.rowsPerPage")}</p>
      <Select
        value={String(props.pageSize)}
        onValueChange={(pageSize) => {
          props.onPaginationChange((_) => ({
            pageIndex: 0,
            pageSize: Number(pageSize),
          }));
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Show on page" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{i18n.t("pagination.pagesCount")}</SelectLabel>
            {props.options.map((count: number) => {
              return (
                <SelectItem value={String(count)} key={count}>
                  {count}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TablePagination;
