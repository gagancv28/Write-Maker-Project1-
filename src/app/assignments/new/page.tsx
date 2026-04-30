"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewAssignmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Copywriting");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // @ts-ignore
  if (session?.user?.role !== "CLIENT") {
    return <div className="p-8 text-center text-red-500">Only Clients can post new assignments.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          location: location || undefined,
          attachmentUrl: attachmentUrl || undefined,
          imageUrl: imageUrl || undefined,
          category,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create assignment");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Assignment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="title">Assignment Title</label>
            <input
              id="title"
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Write a 500-word blog post on React"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="category">Category</label>
            <select
              id="category"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Copywriting">Copywriting</option>
              <option value="Tech Writing">Tech Writing</option>
              <option value="Creative">Creative</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              required
              rows={5}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific instructions, tone, and requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="attachmentUrl">
              Attachment Link <span className="text-gray-400 font-normal">(Google Drive, Dropbox, etc. — optional)</span>
            </label>
            <input
              id="attachmentUrl"
              type="url"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="imageUrl">
              Cover Photo URL <span className="text-gray-400 font-normal">(paste a direct image link — optional)</span>
            </label>
            <input
              id="imageUrl"
              type="url"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="location">Location / Address <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              id="location"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Mumbai, Maharashtra or Remote"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="price">Fixed Price Budget (₹)</label>
            <input
              id="price"
              type="number"
              min="5"
              step="0.01"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-blue-900 font-medium"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 50.00"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
