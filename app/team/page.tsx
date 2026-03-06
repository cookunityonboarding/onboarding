"use client";
import { useAuth } from "../../hooks/useAuth";

export default function TeamPage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CX Leadership Team</h1>
      {user ? (
        <p>Welcome, {user.name || user.email}! This area will show the team members.</p>
      ) : (
        <p>No user detected. Please log in.</p>
      )}
    </div>
  );
}