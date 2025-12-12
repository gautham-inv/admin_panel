import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get distinct values for filterable columns using Prisma
    const allApplications = await prisma.application.findMany({
      select: {
        jobTitle: true,
        specialization: true,
        yearOfGrad: true,
        backlogs: true,
        cgpa: true,
      },
    });

    // Extract unique values
    const jobTitles = Array.from(
      new Set(allApplications.map((app) => app.jobTitle).filter(Boolean))
    ).sort() as string[];

    const specializations = Array.from(
      new Set(allApplications.map((app) => app.specialization))
    ).sort();

    const years = Array.from(
      new Set(allApplications.map((app) => app.yearOfGrad))
    ).sort();

    const backlogsList = Array.from(
      new Set(allApplications.map((app) => app.backlogs))
    ).sort();

    // Create practical CGPA ranges: 7-8, 8-9, 9-10, 10+
    const cgpaRangesList: string[] = ["7-8", "8-9", "9-10", "10+"];

    return NextResponse.json({
      jobTitles,
      specializations,
      years,
      backlogs: backlogsList,
      cgpaRanges: cgpaRangesList,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
