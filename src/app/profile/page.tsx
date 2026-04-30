"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setBio((session.user as any).bio || "");
      setAvatarUrl((session.user as any).avatarUrl || "");
    }
  }, [session]);

  const saveBio = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    await update();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (status === "loading") {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-blue-600 px-8 py-10 text-white">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-blue-100 text-sm mt-1">Manage your avatar and bio</p>
        </div>

        <div className="p-8 space-y-8">

          {/* ── Avatar ──────────────────────────────────────────────────── */}
          <div className="flex justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-blue-100">
                {initials}
              </div>
            )}
          </div>

          {/* ── Bio ─────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">
              Bio{" "}
              <span className="text-gray-400 font-normal">
                (tell writers / clients about yourself)
              </span>
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
              placeholder="e.g. Experienced copywriter specialising in SaaS and fintech content…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={saveBio}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Bio"}
              </button>
            </div>
          </div>

          {/* ── Name / Email (read-only) ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 border-t pt-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm font-semibold text-gray-800">{session?.user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-800">{session?.user?.email || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
