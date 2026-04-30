"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Assignment {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  location?: string;
  attachmentUrl?: string;
  imageUrl?: string;
  category?: string;
  client: { name: string; rating: number };
  createdAt: string;
}

export default function AssignmentsFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const CATEGORIES = ["All", "Copywriting", "Tech Writing", "Creative", "Other"];

  const filtered = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // @ts-ignore
      if (session?.user?.role !== "WRITER") {
        router.push("/dashboard");
        return;
      }
      
      fetch("/api/assignments")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAssignments(data);
          } else {
            setError(data.error || "Failed to load assignments");
          }
        })
        .catch(() => setError("Network error loading assignments"))
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        setAssignments(assignments.filter((a) => a.id !== id));
        alert("Assignment accepted!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept assignment");
      }
    } catch (err) {
      alert("Error accepting assignment");
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-12 text-center text-gray-300 text-lg">Loading assignments...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Available Assignments</h1>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            id="search-assignments"
            type="text"
            placeholder="Search by job title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-xl shadow-sm px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-50 p-4 rounded-md text-red-600 mb-6">{error}</div>}

      {filtered.length === 0 && !error ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {search || categoryFilter !== "All" ? "No matching jobs found" : "No jobs available"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || categoryFilter !== "All" ? "Try adjusting your search or filter." : "Check back later for new assignments."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col">
              {assignment.imageUrl ? (
                <img
                  src={assignment.imageUrl}
                  alt={assignment.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                  <span className="text-5xl opacity-30">📋</span>
                </div>
              )}
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{assignment.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2 shrink-0">
                    ₹{assignment.price.toFixed(2)}
                  </span>
                </div>
                {assignment.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
                    {assignment.category}
                  </span>
                )}
                {assignment.location && (
                  <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                    📍 <span>{assignment.location}</span>
                  </p>
                )}
                {assignment.attachmentUrl && (
                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium mb-3 hover:underline transition-colors"
                  >
                    📎 View Attachments
                  </a>
                )}
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{assignment.description}</p>
                <div className="text-xs text-gray-500 flex items-center font-medium">
                  <span>Client: {assignment.client.name}</span>
                  <span className="mx-2">•</span>
                  <span>Posted: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => handleAccept(assignment.id)}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Accept Assignment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
