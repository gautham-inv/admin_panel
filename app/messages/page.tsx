import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/app/components/AdminHeader";
import MessagesTableClient from "@/app/components/MessagesTableClient";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
        </div>

        <MessagesTableClient messages={messages} />
      </div>
    </div>
    </>
  );
}
