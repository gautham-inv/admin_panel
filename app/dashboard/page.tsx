import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminHeader from "../components/AdminHeader";
import ApplicationsChart from "../components/ApplicationsChart";

export default async function DashboardPage() {
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

  // Get total counts
  const totalApplications = await prisma.application.count();
  const totalMessages = await prisma.contactMessage.count();

  // Get monthly application submission data from analytics events (submit button clicks)
  // This tracks when users click submit on the application form
  let monthlyData: { month: string; applications: number }[] = [];
  
  try {
    // Get application form submit events from analytics_events table
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const applicationSubmitEvents = await prisma.analyticsEvent.findMany({
      where: {
        eventName: "application_form_submit",
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Process data into monthly buckets
    monthlyData = processMonthlyAnalyticsData(applicationSubmitEvents);
  } catch (error) {
    // If analytics table doesn't exist or Prisma client not regenerated, use empty data
    console.log("Analytics events not available, using empty chart data");
    monthlyData = getEmptyMonthlyData();
  }

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's an overview of your admin panel.</p>
          </div>

          {/* Analytics Chart Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Applications Overview</h2>
              <p className="text-gray-600">Monthly application submissions</p>
            </div>
            <ApplicationsChart data={monthlyData} />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applications Card */}
            <Link
              href="/applications"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Applications</h2>
                {unreadApplications > 0 && (
                  <span className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                    {unreadApplications}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">View job applications</p>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold text-[#005C89]">{totalApplications}</div>
                  <p className="text-xs text-gray-500 mt-1">Total applications</p>
                </div>
                <div className="text-[#66C2E2] font-medium group-hover:text-[#005C89] transition-colors text-sm">
                  View all →
                </div>
              </div>
            </Link>

            {/* Contact Messages Card */}
            <Link
              href="/messages"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Contact Messages</h2>
                {unreadMessages > 0 && (
                  <span className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                    {unreadMessages}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">View contact form submissions</p>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold text-[#005C89]">{totalMessages}</div>
                  <p className="text-xs text-gray-500 mt-1">Total messages</p>
                </div>
                <div className="text-[#66C2E2] font-medium group-hover:text-[#005C89] transition-colors text-sm">
                  View all →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to process analytics events into monthly buckets
function processMonthlyAnalyticsData(events: any[]) {
  const monthlyMap = new Map<string, number>();
  
  // Count events by month
  events.forEach((event) => {
    const date = new Date(event.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
  });

  // Get last 12 months
  const result = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    result.push({
      month: monthName,
      applications: monthlyMap.get(monthKey) || 0,
    });
  }

  return result;
}

// Helper function to get empty monthly data (when analytics not available)
function getEmptyMonthlyData() {
  const result = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    result.push({
      month: monthName,
      applications: 0,
    });
  }

  return result;
}