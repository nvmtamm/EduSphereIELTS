import { Table } from "@tanstack/react-table"
import { X, Search } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumnKey?: string
  searchPlaceholder?: string
  difficultyOptions?: { label: string; value: string }[]
  sourceTypeOptions?: { label: string; value: string }[]
}

export function DataTableToolbar<TData>({
  table,
  searchColumnKey = "title",
  searchPlaceholder = "Search exams...",
  difficultyOptions,
  sourceTypeOptions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative w-full sm:w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumnKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumnKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-full pl-9 pr-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-red-500 text-zinc-900 dark:text-white"
          />
        </div>

        {/* Faceted Filters */}
        {difficultyOptions && table.getColumn("difficulty") && (
          <DataTableFacetedFilter
            column={table.getColumn("difficulty")}
            title="Difficulty"
            options={difficultyOptions}
          />
        )}

        {sourceTypeOptions && table.getColumn("sourceType") && (
          <DataTableFacetedFilter
            column={table.getColumn("sourceType")}
            title="Exam Vault"
            options={sourceTypeOptions}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Reset
            <X className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* View Columns toggle */}
      <DataTableViewOptions table={table} />
    </div>
  )
}
