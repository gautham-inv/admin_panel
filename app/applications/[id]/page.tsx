import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/app/components/AdminHeader";

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
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
        <Link
          href="/applications"
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block hover:underline"
        >
          ← Back to Applications
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
            Application Details
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Basic Information
              </h2>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Full Name
              </label>
              <p className="text-lg text-gray-900">{application.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Job Title
              </label>
              <p className="text-lg text-gray-900">{application.jobTitle}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Email Address
              </label>
              <p className="text-lg text-gray-900">
                <a
                  href={`mailto:${application.email}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {application.email}
                </a>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                WhatsApp Number
              </label>
              <p className="text-lg text-gray-900">
                <a
                  href={`https://wa.me/${application.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {application.whatsapp}
                </a>
              </p>
            </div>

            {/* Educational Information */}
            <div className="space-y-6 md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-t pt-6">
                Educational Information
              </h2>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                College/University
              </label>
              <p className="text-lg text-gray-900">{application.college}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Specialization
              </label>
              <p className="text-lg text-gray-900">{application.specialization}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Year of Graduation
              </label>
              <p className="text-lg text-gray-900">{application.yearOfGrad}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                CGPA
              </label>
              <p className="text-lg text-gray-900">{application.cgpa}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Backlogs
              </label>
              <p className="text-lg text-gray-900">
                {application.backlogs === "0" ? "No backlogs" : application.backlogs}
              </p>
            </div>

            {/* Documents & Submission */}
            <div className="space-y-6 md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-t pt-6">
                Documents & Submission
              </h2>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Resume
              </label>
              <div className="mt-2">
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Resume
                </a>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Submitted On
              </label>
              <p className="text-lg text-gray-900">
                {new Date(application.uploadedAt).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}