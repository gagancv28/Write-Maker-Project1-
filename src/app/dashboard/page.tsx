import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";
import DashboardJobs from "@/components/DashboardJobs";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const isClient = user.role === "CLIENT" || user.role === "Client";

  let assignments: any[] = [];
  try {
    if (isClient) {
      assignments = await prisma.assignment.findMany({
        where: { clientId: user.id },
        include: { writer: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      assignments = await prisma.assignment.findMany({
        where: { writerId: user.id, status: "IN_PROGRESS" },
        include: { client: { select: { name: true, email: true } } }
      });
    }
  } catch (error) {
    console.error("Database error:", error);
  }

  async function completeJob(formData: FormData) {
    "use server";
    const assignmentId = formData.get("assignmentId") as string;
    if (!assignmentId) return;

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "COMPLETED" },
      include: { client: { select: { email: true, name: true } }, writer: { select: { name: true } } }
    });
// Add this check to ensure user exists before calling the update
if (user && user.id) {
  await prisma.user.update({
    where: { 
      id: user.id 
    },
    data: { 
      completedAssignmentsCount: { 
        increment: 1 
      } 
    }
  });
} else {
  // This handles the case where the user is null or undefined
  console.warn("Update skipped: No valid user found.");
}
    // Email the client
    if (process.env.RESEND_API_KEY && assignment.client?.email) {
      await resend.emails.send({
        from: "WriteMarket <onboarding@resend.dev>",
        to: assignment.client.email,
        subject: `Your assignment "${assignment.title}" has been completed!`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#16a34a;">Assignment Completed! ✅</h2>
            <p>Hi ${assignment.client.name || "there"},</p>
            <p>Your assignment <strong>${assignment.title}</strong> has been marked complete by ${assignment.writer?.name || "your writer"}.</p>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3001"}/dashboard"
               style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">
              View Dashboard
            </a>
          </div>
        `,
      });
    }

    revalidatePath("/dashboard");
  }

  async function cancelJob(formData: FormData) {
    "use server";
    const assignmentId = formData.get("assignmentId") as string;
    if (!assignmentId) return;

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: "OPEN",
        writerId: null,
      },
    });

    revalidatePath("/dashboard");
  }

  async function deleteClientJob(formData: FormData) {
    "use server";
    const assignmentId = formData.get("assignmentId") as string;
    if (!assignmentId) return;

    await prisma.message.deleteMany({
      where: { assignmentId: assignmentId },
    });

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/assignments");
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">

        {/* Top Header Section */}
        <div className="bg-blue-600 px-8 py-12 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {user.name || "User"}!</h1>
              <p className="text-blue-100 text-lg">{user.email}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center">
              <span className="block text-blue-100 text-xs font-bold uppercase mb-1">Completed Assignments</span>
              <span className="text-4xl font-black text-white">{user.completedAssignmentsCount}</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 rounded-xl p-6 border text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Current Role</h3>
              <div className="inline-flex items-center px-4 py-1 rounded-full text-lg font-bold bg-indigo-100 text-indigo-800">
                {user.role}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Marketplace Action</h3>
              <div className="flex justify-center">
                {isClient ? (
                  <Link href="/assignments/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    + Post New Assignment
                  </Link>
                ) : (
                  <Link href="/assignments" className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 px-6 rounded-lg transition-colors">
                    Browse Marketplace
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Active Jobs Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
              {isClient ? "Your Posted Assignments" : "Your Active Jobs"}
            </h2>

            {assignments.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500 font-medium">
                {isClient ? "You haven't posted any jobs yet." : "You have no active jobs right now."}
              </div>
            ) : (
              <DashboardJobs 
                assignments={assignments} 
                currentUserId={user.id} 
                isClient={isClient} 
                completeJobAction={completeJob}
                cancelJobAction={cancelJob}
                deleteClientJobAction={deleteClientJob}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}