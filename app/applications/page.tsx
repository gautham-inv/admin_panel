import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/app/components/AdminHeader";
import ApplicationsTableClient from "@/app/components/ApplicationsTableClient";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const applications = await prisma.application.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const unreadCount = await prisma.application.count({
    where: { isRead: false },
  });

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">
                {unreadCount} unread application{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
        </div>

        <ApplicationsTableClient applications={applications} />
      </div>
    </div>
    </>
  );
}