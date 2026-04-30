"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (signInRes?.error) {
          setError("Failed to log in after registration");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow border">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Register</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="space-y-4">
            <input
              type="text" required placeholder="Name"
              className="w-full px-3 py-2 border rounded-md text-blue-900 font-medium"
              value={name} onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email" required placeholder="Email"
              className="w-full px-3 py-2 border rounded-md text-blue-900 font-medium"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password" required placeholder="Password"
              className="w-full px-3 py-2 border rounded-md text-blue-900 font-medium"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="role" value="CLIENT" checked={role === "CLIENT"} onChange={() => setRole("CLIENT")} />
                <span className="ml-2 text-sm text-gray-900">Client</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="WRITER" checked={role === "WRITER"} onChange={() => setRole("WRITER")} />
                <span className="ml-2 text-sm text-gray-900">Writer</span>
              </label>
            </div>
          </div>
          <button type="submit" className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Create Account
          </button>
        </form>
        <div className="text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}
