import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/app/components/AdminHeader";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!message) {
    notFound();
  }

  // Mark as read
  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
        <Link
          href="/messages"
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
        >
          ← Back to Messages
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Message Details
          </h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-lg text-gray-900">{message.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg text-gray-900">{message.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Received</label>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
