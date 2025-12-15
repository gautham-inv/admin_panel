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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(applications);
    setSelected({});
  }, [applications]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const allSelectableIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allSelected =
    allSelectableIds.length > 0 &&
    allSelectableIds.every((id) => selected[id]);
  const someSelected =
    allSelectableIds.some((id) => selected[id]) && !allSelected;

  const toggleAll = (next: boolean) => {
    const map: Record<string, boolean> = {};
    allSelectableIds.forEach((id) => {
      map[id] = next;
    });
    setSelected(map);
  };

  const toggleOne = (id: string, next: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: next }));
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
      const msg = await res.text().catch(() => "Failed to delete");
      alert(msg);
      return;
    }

    setRows((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setSelected({});
    startTransition(() => router.refresh());
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedIds.length > 0 ? (
            <span>
              <span className="font-semibold text-gray-900">
                {selectedIds.length}
              </span>{" "}
              selected
            </span>
          ) : (
            <span>Select applications to delete</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleAll(false)}
            className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            disabled={selectedIds.length === 0 || isPending}
          >
            {isPending ? "Deleting..." : "Delete selected"}
          </button>
        </div>
      </div>

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
                  aria-label="Select all applications"
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
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No applications yet
                </td>
              </tr>
            ) : (
              rows.map((app) => (
                <tr
                  key={app.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    app.isRead ? "" : "bg-blue-50"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!selected[app.id]}
                      onChange={(e) => toggleOne(app.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
                      aria-label={`Select application from ${app.name}`}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        !app.isRead
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {!app.isRead ? "New" : "Viewed"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {app.name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.jobTitle || "-"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                    {app.college}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.yearOfGrad}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
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
  );
}


