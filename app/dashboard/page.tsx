import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get unread counts
  const unreadApplications = await prisma.application.count({
    where: { isRead: false },
  });

  const unreadMessages = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  const totalUnread = unreadApplications + unreadMessages;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {session.user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Applications Card */}
          <Link
            href="/applications"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
                <p className="text-gray-600 mt-1">View job applications</p>
              </div>
              {unreadApplications > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {unreadApplications}
                </span>
              )}
            </div>
          </Link>

          {/* Contact Messages Card */}
          <Link
            href="/messages"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Contact Messages</h2>
                <p className="text-gray-600 mt-1">View contact form submissions</p>
              </div>
              {unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </div>
          </Link>
        </div>

        {totalUnread > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              You have <strong>{totalUnread}</strong> unread item{totalUnread !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

