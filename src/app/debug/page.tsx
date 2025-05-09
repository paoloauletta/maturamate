"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DebugPage() {
  const [info, setInfo] = useState({
    environment: "",
    nodeEnv: "",
    baseUrl: "",
    timestamp: "",
    nextVersion: "",
  });

  useEffect(() => {
    setInfo({
      environment: typeof window !== "undefined" ? "client" : "server",
      nodeEnv: process.env.NODE_ENV || "unknown",
      baseUrl: window.location.origin,
      timestamp: new Date().toISOString(),
      nextVersion: process.env.NEXT_PUBLIC_VERSION || "unknown",
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Debug Page</h1>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Info</h2>
        <pre className="whitespace-pre-wrap bg-white p-3 rounded border">
          {JSON.stringify(info, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Links</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard/teoria/test-topic"
              className="text-blue-600 hover:underline"
            >
              Test Teoria Page (/dashboard/teoria/test-topic)
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/esercizi/test-topic"
              className="text-blue-600 hover:underline"
            >
              Test Esercizi Page (/dashboard/esercizi/test-topic)
            </Link>
          </li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Route Tests</h2>
        <p className="mb-4">
          Click buttons to test if routes resolve properly:
        </p>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() =>
              (window.location.href = "/dashboard/teoria/test-topic")
            }
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Navigate to /dashboard/teoria/test-topic
          </button>

          <button
            onClick={() => (window.location.href = "/teoria/test-topic")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Navigate to /teoria/test-topic (should rewrite)
          </button>
        </div>
      </div>
    </div>
  );
}
