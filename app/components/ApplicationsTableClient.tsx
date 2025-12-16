"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ApplicationRow = {
  id: string;
  name: string;
  jobTitle: string | null;
  college: string;
  yearOfGrad: string;
  cgpa?: number | null;
  uploadedAt: string | Date;
  isRead: boolean;
};

export default function ApplicationsTableClient({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ApplicationRow[]>(applications);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [jobFilters, setJobFilters] = useState<Record<string, boolean>>({});
  const [yearFilters, setYearFilters] = useState<Record<string, boolean>>({});
  const [cgpaAbove8, setCgpaAbove8] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(applications);
    setSelected({});
    setJobFilters({});
    setYearFilters({});
    setCgpaAbove8(false);
    setMobileFiltersOpen(false);
  }, [applications]);

  const jobTitleOptions = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((r) => {
      const jt = (r.jobTitle || "").trim();
      if (jt) unique.add(jt);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const activeJobTitles = useMemo(
    () => Object.entries(jobFilters).filter(([, v]) => v).map(([k]) => k),
    [jobFilters]
  );

  const yearOptions = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((r) => {
      const y = (r.yearOfGrad || "").trim();
      if (y) unique.add(y);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const activeYears = useMemo(
    () => Object.entries(yearFilters).filter(([, v]) => v).map(([k]) => k),
    [yearFilters]
  );

  const filteredRows = useMemo(() => {
    let out = rows;

    if (activeJobTitles.length > 0) {
      const set = new Set(activeJobTitles);
      out = out.filter((r) => set.has((r.jobTitle || "").trim()));
    }

    if (activeYears.length > 0) {
      const set = new Set(activeYears);
      out = out.filter((r) => set.has((r.yearOfGrad || "").trim()));
    }

    if (cgpaAbove8) {
      out = out.filter((r) => {
        const v = typeof r.cgpa === "number" ? r.cgpa : Number(r.cgpa);
        return Number.isFinite(v) && v >= 8;
      });
    }

    return out;
  }, [rows, activeJobTitles, activeYears, cgpaAbove8]);

  // When filters change, clear selection to avoid deleting hidden rows accidentally
  useEffect(() => {
    setSelected({});
  }, [activeJobTitles.join("|"), activeYears.join("|"), cgpaAbove8]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const allSelectableIds = useMemo(
    () => filteredRows.map((r) => r.id),
    [filteredRows]
  );

  const allSelected =
    allSelectableIds.length > 0 &&
    allSelectableIds.every((id) => selected[id]);

  const someSelected =
    allSelectableIds.some((id) => selected[id]) && !allSelected;

  const toggleAll = (next: boolean) => {
    const map: Record<string, boolean> = {};
    allSelectableIds.forEach((id) => (map[id] = next));
    setSelected(map);
  };

  const toggleOne = (id: string, next: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: next }));
  };

  const toggleJobFilter = (jobTitle: string, next: boolean) => {
    setJobFilters((prev) => ({ ...prev, [jobTitle]: next }));
  };

  const toggleYearFilter = (year: string, next: boolean) => {
    setYearFilters((prev) => ({ ...prev, [year]: next }));
  };

  const clearFilters = () => {
    setJobFilters({});
    setYearFilters({});
    setCgpaAbove8(false);
  };

  const onDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(
      `Delete ${selectedIds.length} application(s)? This cannot be undone.`
    );
    if (!ok) return;

    const res = await fetch("/api/applications/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (!res.ok) {
      alert("Failed to delete applications");
      return;
    }

    setRows((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setSelected({});
    startTransition(() => router.refresh());
  };

  const hasActiveFilters =
    activeJobTitles.length > 0 || activeYears.length > 0 || cgpaAbove8;

  const FiltersPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Filters</div>
          <div className="text-xs text-gray-500 mt-1">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredRows.length}
            </span>{" "}
            / {rows.length}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm border border-gray-200 hover:bg-gray-50"
          >
            Close
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Clear all filters
        </button>
      )}

      {/* CGPA filter */}
      <div>
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          CGPA
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={cgpaAbove8}
            onChange={(e) => setCgpaAbove8(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
          />
          Above 8 (≥ 8)
        </label>
      </div>

      {/* Year filter */}
      {yearOptions.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Year of Graduation
          </div>
          <div className="mt-2 space-y-2 max-h-[220px] overflow-auto pr-1">
            {yearOptions.map((y) => (
              <label key={y} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!yearFilters[y]}
                  onChange={(e) => toggleYearFilter(y, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
                />
                <span className="text-gray-700">{y}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Job filter */}
      {jobTitleOptions.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Job
          </div>
          <div className="mt-2 space-y-2 max-h-[260px] overflow-auto pr-1">
            {jobTitleOptions.map((jt) => (
              <label key={jt} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!jobFilters[jt]}
                  onChange={(e) => toggleJobFilter(jt, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
                />
                <span className="text-gray-700">{jt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Desktop side panel */}
        <aside className="hidden md:block w-[280px] border-r border-gray-200 bg-gray-50/30 p-4">
          <div className="sticky top-4">
            <FiltersPanel />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Applications
              </h2>
              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({selectedIds.length} selected)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filters button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
              >
                Filters{hasActiveFilters ? " •" : ""}
              </button>

              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleAll(false)}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={onDeleteSelected}
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {isPending ? "Deleting…" : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-[88%] max-w-[380px] bg-white shadow-xl p-4 overflow-auto">
                <FiltersPanel onClose={() => setMobileFiltersOpen(false)} />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
                />
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  {rows.length === 0
                    ? "No applications yet"
                    : "No applications match the selected filters"}
                </td>
              </tr>
            ) : (
              filteredRows.map((app) => (
                <tr
                  key={app.id}
                  className={`hover:bg-gray-50 transition ${
                    app.isRead ? "" : "bg-blue-50"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <input
                      type="checkbox"
                      checked={!!selected[app.id]}
                      onChange={(e) =>
                        toggleOne(app.id, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.isRead
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.isRead ? "Viewed" : "New"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {app.jobTitle || "-"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {app.college}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {app.yearOfGrad}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-[#005C89] hover:text-[#004066] font-medium text-sm transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}