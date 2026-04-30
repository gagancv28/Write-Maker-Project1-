"use client";

import { useState } from "react";
import ChatDialog from "./ChatDialog";

export default function DashboardJobs({ assignments, currentUserId, isClient, completeJobAction, cancelJobAction, deleteClientJobAction }: any) {
  const [selectedJob, setSelectedJob] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((job: any) => (
          <div key={job.id} className="bg-white border-2 border-gray-100 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden">
            {job.imageUrl ? (
              <img
                src={job.imageUrl}
                alt={job.title}
                className="w-full h-48 object-cover rounded-t-xl mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center rounded-t-xl mb-4">
                <span className="text-5xl opacity-30">📋</span>
              </div>
            )}
            <div className="px-6 pb-6">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
                <span className="font-black text-xl text-green-600">₹{job.price}</span>
              </div>

              {job.location && (
                <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                  📍 <span>{job.location}</span>
                </p>
              )}

              {job.attachmentUrl && (
                <a
                  href={job.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 hover:underline transition-colors"
                >
                  📎 View Attachments
                </a>
              )}

              <p className="text-xs text-blue-600 font-bold uppercase tracking-tight mt-1">
                {isClient
                  ? (job.writer ? `Assigned to: ${job.writer.name}` : "Waiting for Writer")
                  : `Client: ${job.client.name}`}
              </p>

              <p className="text-gray-600 mt-3 text-sm line-clamp-3">{job.description}</p>

              <div className="mt-5 flex gap-2">
                {/* CHAT BUTTON */}
                {(job.writerId || job.clientId) && (
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    💬 Message {isClient ? "Writer" : "Client"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {job.status.replace("_", " ")}
              </span>

              {!isClient && job.status === "IN_PROGRESS" && (
                <div className="flex items-center gap-2">
                  <form action={completeJobAction}>
                    <input type="hidden" name="assignmentId" value={job.id} />
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-lg shadow-green-100">
                      ✓ Mark as Complete
                    </button>
                  </form>

                  <form action={cancelJobAction}>
                    <input type="hidden" name="assignmentId" value={job.id} />
                    <button
                      type="submit"
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-lg shadow-red-100"
                      onClick={(e) => {
                        if (!window.confirm("Are you sure you want to cancel? This will return the job to the public marketplace."))
                          e.preventDefault();
                      }}
                    >
                      ✕ Cancel Job
                    </button>
                  </form>
                </div>
              )}

              {isClient && job.status === "OPEN" && (
                <form action={deleteClientJobAction} className="mt-4">
                  <input type="hidden" name="assignmentId" value={job.id} />
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-lg shadow-red-100"
                    onClick={(e) => {
                      if (!window.confirm("Are you sure you want to cancel and delete this job posting?"))
                        e.preventDefault();
                    }}
                  >
                    ✕ Cancel Posting
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <ChatDialog
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          assignmentId={selectedJob.id}
          currentUserId={currentUserId}
          receiverId={isClient ? selectedJob.writerId : selectedJob.clientId}
        />
      )}
    </>
  );
}
