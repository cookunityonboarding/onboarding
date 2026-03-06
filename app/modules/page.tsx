"use client";
import { useAuth } from "../../hooks/useAuth";

export default function ModulesPage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Training Modules</h1>
      {user ? (
        <p>Welcome, {user.name || user.email}! This area will display the onboarding curriculum.</p>
      ) : (
        <p>No user detected. Please log in.</p>
      )}
    </div>
  );
}