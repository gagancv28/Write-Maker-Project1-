"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow border">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="space-y-4">
            <input
              type="email" required placeholder="Email address"
              className="w-full px-3 py-2 border rounded-md text-blue-900 font-medium"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password" required placeholder="Password"
              className="w-full px-3 py-2 border rounded-md text-blue-900 font-medium"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Sign in
          </button>
        </form>
        <div className="text-center text-sm">
          <Link href="/register" className="text-blue-600 hover:text-blue-500">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}
