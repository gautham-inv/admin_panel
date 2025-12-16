"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  createdAt: string | Date;
  isRead: boolean;
};

export default function MessagesTableClient({
  messages,
}: {
  messages: MessageRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<MessageRow[]>(messages);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(messages);
    setSelected({});
  }, [messages]);

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
    allSelectableIds.forEach((id) => (map[id] = next));
    setSelected(map);
  };

  const toggleOne = (id: string, next: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: next }));
  };

  const onDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(
      `Delete ${selectedIds.length} message(s)? This cannot be undone.`
    );
    if (!ok) return;

    const res = await fetch("/api/messages/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (!res.ok) {
      alert("Failed to delete messages");
      return;
    }

    setRows((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setSelected({});
    startTransition(() => router.refresh());
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* 🔹 Single Header with Inline Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
        {/* Left side: Title and selection count */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Contact Messages
          </h2>

          {selectedIds.length > 0 && (
            <span className="text-sm text-gray-500">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>

        {/* Right side: Action buttons */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* 🔹 Table */}
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
                Email
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
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
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No messages yet
                </td>
              </tr>
            ) : (
              rows.map((msg) => (
                <tr
                  key={msg.id}
                  className={`hover:bg-gray-50 transition ${
                    msg.isRead ? "" : "bg-blue-50"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <input
                      type="checkbox"
                      checked={!!selected[msg.id]}
                      onChange={(e) =>
                        toggleOne(msg.id, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#005C89] focus:ring-[#005C89]"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        msg.isRead
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {msg.isRead ? "Viewed" : "New"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {msg.name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {msg.email}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {msg.subject || "-"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/messages/${msg.id}`}
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
  );
}