import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    notFound();
  }

  // Mark as read
  await prisma.application.update({
    where: { id },
    data: { isRead: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/applications"
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
        >
          ← Back to Applications
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Application Details
          </h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-lg text-gray-900">{application.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg text-gray-900">{application.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">WhatsApp</label>
              <p className="mt-1 text-lg text-gray-900">{application.whatsapp}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Specialization</label>
              <p className="mt-1 text-lg text-gray-900">{application.specialization}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">CGPA</label>
              <p className="mt-1 text-lg text-gray-900">{application.cgpa}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">College</label>
              <p className="mt-1 text-lg text-gray-900">{application.college}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Year of Graduation</label>
              <p className="mt-1 text-lg text-gray-900">{application.yearOfGrad}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Backlogs</label>
              <p className="mt-1 text-lg text-gray-900">{application.backlogs}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Resume</label>
              <div className="mt-1">
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Resume →
                </a>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Submitted</label>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(application.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

