"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  MoreVertical,
} from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface BulkAction<T> {
  label: string;
  variant?: "default" | "danger" | "success";
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FacetFilter {
  key: string;
  label: string;
  options: FilterOption[];
}

interface AdminDataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  filters?: FacetFilter[];
  bulkActions?: BulkAction<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  pageSizeDefault?: number;
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  searchKey,
  filters = [],
  bulkActions = [],
  onRowClick,
  isLoading = false,
  onRefresh,
  title,
  subtitle,
  actions,
  pageSizeDefault = 10,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeDefault);

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search matching
      if (search.trim()) {
        const query = search.toLowerCase();
        let match = false;
        if (typeof searchKey === "function") {
          match = searchKey(row).toLowerCase().includes(query);
        } else if (searchKey && row[searchKey]) {
          match = String(row[searchKey]).toLowerCase().includes(query);
        } else {
          // General search across all string values
          match = Object.values(row).some((val) =>
            String(val).toLowerCase().includes(query)
          );
        }
        if (!match) return false;
      }

      // Facet filters matching
      for (const [filterKey, filterVal] of Object.entries(activeFilters)) {
        if (!filterVal || filterVal === "all") continue;
        const rowVal = String((row as any)[filterKey]);
        if (rowVal !== filterVal) return false;
      }

      return true;
    });
  }, [data, search, searchKey, activeFilters]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      let aVal = col?.accessor ? col.accessor(a) : (a as any)[sortKey];
      let bVal = col?.accessor ? col.accessor(b) : (b as any)[sortKey];

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((d) => d.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedRows = useMemo(() => {
    return data.filter((d) => selectedIds.has(d.id));
  }, [data, selectedIds]);

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => `"${c.header}"`).join(",");
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : (row as any)[c.key];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mgn_admin_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="border-b border-slate-800/80 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
                title="Refresh Table"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            )}

            <button
              type="button"
              onClick={exportCSV}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {actions}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Facet Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <div key={filter.key} className="relative">
                  <select
                    value={activeFilters[filter.key] || "all"}
                    onChange={(e) => {
                      setActiveFilters((prev) => ({
                        ...prev,
                        [filter.key]: e.target.value,
                      }));
                      setCurrentPage(1);
                    }}
                    className="h-9 appearance-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 pr-8 text-xs font-medium text-slate-300 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All {filter.label}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions Banner */}
        {selectedIds.size > 0 && bulkActions.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <CheckSquare className="h-4 w-4" />
              <span>{selectedIds.size} records selected</span>
            </div>

            <div className="flex items-center gap-2">
              {bulkActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => action.onClick(selectedRows)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    action.variant === "danger"
                      ? "bg-rose-600 text-white hover:bg-rose-500"
                      : action.variant === "success"
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {bulkActions.length > 0 && (
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex items-center text-slate-400 hover:text-white"
                  >
                    {selectedIds.size > 0 && selectedIds.size === paginatedData.length ? (
                      <CheckSquare className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 font-bold select-none ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    } ${col.sortable ? "cursor-pointer hover:text-white" : ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === "right" ? "justify-end" : ""
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span>
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-blue-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {bulkActions.length > 0 && <td className="py-4 px-4"><div className="h-4 w-4 bg-slate-800 rounded"></div></td>}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                  className="py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-slate-400">No matching records found</p>
                    <p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`group transition-colors ${
                      isSelected ? "bg-blue-500/5" : "hover:bg-slate-800/40"
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {bulkActions.length > 0 && (
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={(e) => toggleSelectRow(row.id, e)}
                          className="flex items-center text-slate-500 group-hover:text-slate-300"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => {
                      const rendered = col.render
                        ? col.render(row)
                        : col.accessor
                        ? col.accessor(row)
                        : (row as any)[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`py-3.5 px-4 ${
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {rendered}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 px-4 py-3 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, sortedData.length)}</strong> of{" "}
            <strong className="text-slate-200">{sortedData.length}</strong> records
          </span>

          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 rounded-lg border border-slate-800 bg-slate-950 px-2 text-xs text-slate-300 focus:outline-none"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 text-xs font-medium text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:hover:border-slate-800 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
