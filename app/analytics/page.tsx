import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/app/components/AdminHeader";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  // Get all analytics events
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  // Form submission analytics
  const formSubmissions = await prisma.analyticsEvent.findMany({
    where: {
      eventName: {
        in: ["contact_form_submit", "application_form_submit"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const contactFormSubmissions = await prisma.analyticsEvent.count({
    where: {
      eventName: "contact_form_submit",
    },
  });

  const applicationFormSubmissions = await prisma.analyticsEvent.count({
    where: {
      eventName: "application_form_submit",
    },
  });

  // User retention - sessions and return visits
  const sessionStarts = await prisma.analyticsEvent.findMany({
    where: {
      eventName: "session_start",
    },
    orderBy: { createdAt: "desc" },
  });

  const returnVisits = await prisma.analyticsEvent.count({
    where: {
      eventName: "return_visit",
    },
  });

  // Get events by date (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const eventsByDate = await prisma.analyticsEvent.groupBy({
    by: ["createdAt"],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Careers analytics
  const careersEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventName: {
        contains: "careers",
      },
    },
  });

  const careersBySource = await prisma.analyticsEvent.groupBy({
    by: ["eventValue"],
    _count: {
      id: true,
    },
    where: {
      eventName: {
        contains: "careers",
      },
      eventValue: {
        not: null,
      },
    },
  });

  // Calculate retention rate
  const totalSessions = sessionStarts.length;
  const retentionRate = totalSessions > 0 
    ? ((returnVisits / totalSessions) * 100).toFixed(1)
    : "0";

  // Get form submission trends (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentFormSubmissions = await prisma.analyticsEvent.count({
    where: {
      eventName: {
        in: ["contact_form_submit", "application_form_submit"],
      },
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Detailed analytics and user behavior insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#005C89] to-[#003d5c] rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-2">Contact Form Submissions</h3>
            <p className="text-4xl font-bold">{contactFormSubmissions}</p>
            <p className="text-sm text-white/70 mt-1">Total submissions</p>
          </div>

          <div className="bg-gradient-to-br from-[#66C2E2] to-[#005C89] rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-2">Application Submissions</h3>
            <p className="text-4xl font-bold">{applicationFormSubmissions}</p>
            <p className="text-sm text-white/70 mt-1">Total applications</p>
          </div>

          <div className="bg-gradient-to-br from-[#005C89] to-[#66C2E2] rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-2">User Sessions</h3>
            <p className="text-4xl font-bold">{totalSessions}</p>
            <p className="text-sm text-white/70 mt-1">Total sessions</p>
          </div>

          <div className="bg-gradient-to-br from-[#66C2E2] to-[#00a3cc] rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-white/80 mb-2">Retention Rate</h3>
            <p className="text-4xl font-bold">{retentionRate}%</p>
            <p className="text-sm text-white/70 mt-1">Return visitors</p>
          </div>
        </div>

        {/* Form Submissions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Form Submission Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-[#005C89]/10 to-[#005C89]/5 rounded-lg border border-[#005C89]/20">
              <p className="text-sm text-gray-600 mb-1">Contact Forms (Last 7 Days)</p>
              <p className="text-2xl font-bold text-[#005C89]">
                {formSubmissions.filter(
                  (e) => e.eventName === "contact_form_submit" && 
                  new Date(e.createdAt) >= sevenDaysAgo
                ).length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#66C2E2]/10 to-[#66C2E2]/5 rounded-lg border border-[#66C2E2]/20">
              <p className="text-sm text-gray-600 mb-1">Applications (Last 7 Days)</p>
              <p className="text-2xl font-bold text-[#66C2E2]">
                {formSubmissions.filter(
                  (e) => e.eventName === "application_form_submit" && 
                  new Date(e.createdAt) >= sevenDaysAgo
                ).length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#00a3cc]/10 to-[#00a3cc]/5 rounded-lg border border-[#00a3cc]/20">
              <p className="text-sm text-gray-600 mb-1">Total (Last 7 Days)</p>
              <p className="text-2xl font-bold text-[#00a3cc]">{recentFormSubmissions}</p>
            </div>
          </div>
        </div>

        {/* User Retention Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Retention Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">New Sessions</p>
              <p className="text-3xl font-bold text-[#005C89]">{totalSessions - returnVisits}</p>
              <p className="text-xs text-gray-500 mt-2">First-time visitors</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Return Visits</p>
              <p className="text-3xl font-bold text-[#66C2E2]">{returnVisits}</p>
              <p className="text-xs text-gray-500 mt-2">Returning visitors</p>
            </div>
          </div>
        </div>

        {/* Careers Engagement */}
        {careersBySource.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Careers Engagement by Source
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {careersBySource.map((item) => (
                <div key={item.eventValue} className="p-4 bg-gradient-to-br from-[#005C89]/10 to-[#66C2E2]/10 rounded-lg border border-[#005C89]/20">
                  <p className="text-sm text-gray-600 capitalize mb-1">
                    {item.eventValue?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-2xl font-bold text-[#005C89]">{item._count.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Events (Last 100)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No events tracked yet
                    </td>
                  </tr>
                ) : (
                  events.slice(0, 100).map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {event.eventName.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {event.eventCategory || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {event.eventValue || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.createdAt).toLocaleString()}
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
    </>
  );
}

