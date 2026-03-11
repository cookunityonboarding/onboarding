"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabaseClient";

type Trainee = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  created_at: string;
  completedModules: number;
  totalModules: number;
  status: "active" | "disabled" | "pending" | "expired";
  invitationId: string | null;
  expiresAt?: string | null;
};

export default function SupervisorTraineesPage() {
  const { user, loading } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviting, setInviting] = useState(false);
  const [resending, setResending] = useState<Record<string, boolean>>({});
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [manageName, setManageName] = useState("");
  const [manageActive, setManageActive] = useState(true);
  const [savingManage, setSavingManage] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const loadTrainees = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch("/api/supervisor/trainees", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Could not load trainees");
      }

      setTrainees(payload.trainees || []);
    } catch (error) {
      console.error("Error loading trainees:", error);
      setFetchError("Could not load trainees. Please refresh the page.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTrainees();
    }
  }, [user, loadTrainees]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setFetchError(null);
    setFetchSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch("/api/supervisor/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(inviteForm),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Could not send invitation");
      }

      await loadTrainees();

      // Reset form and close modal
      setInviteForm({ name: "", email: "" });
      setShowInviteModal(false);
    } catch (error) {
      console.error("Error inviting trainee:", error);
      setFetchError(
        error instanceof Error ? error.message : "Could not send invitation"
      );
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setResending((prev) => ({ ...prev, [invitationId]: true }));
    setFetchError(null);
    setFetchSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch(
        `/api/supervisor/invitations/${invitationId}/resend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Could not resend invitation");
      }

      await loadTrainees();
    } catch (error) {
      console.error("Error resending invitation:", error);
      setFetchError(
        error instanceof Error ? error.message : "Could not resend invitation"
      );
    } finally {
      setResending((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  const openManageModal = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setManageName(trainee.name || "");
    setManageActive(trainee.active);
    setShowManageModal(true);
  };

  const closeManageModal = () => {
    setShowManageModal(false);
    setSelectedTrainee(null);
    setManageName("");
    setManageActive(true);
  };

  const handleSaveTrainee = async () => {
    if (!selectedTrainee) return;

    setSavingManage(true);
    setFetchError(null);
    setFetchSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch(`/api/supervisor/trainees/${selectedTrainee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: manageName,
          active: manageActive,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Could not update trainee");
      }

      await loadTrainees();
      setFetchSuccess("Trainee updated successfully.");
      closeManageModal();
    } catch (error) {
      console.error("Error updating trainee:", error);
      setFetchError(error instanceof Error ? error.message : "Could not update trainee");
    } finally {
      setSavingManage(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!selectedTrainee) return;

    setSendingReset(true);
    setFetchError(null);
    setFetchSuccess(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch(
        `/api/supervisor/trainees/${selectedTrainee.id}/reset-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Could not send password reset email");
      }

      setFetchSuccess(`Password reset email sent to ${selectedTrainee.email}.`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setFetchError(
        error instanceof Error
          ? error.message
          : "Could not send password reset email"
      );
    } finally {
      setSendingReset(false);
    }
  };

  if (loading || fetchLoading) {
    return <p className="p-8">Loading trainees...</p>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <p>No user detected. Please log in.</p>
      </div>
    );
  }

  const allowedRoles = ["supervisor", "manager", "assistant_manager"];
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-8">
        <p className="text-red-600">You do not have permission to view supervisor tools.</p>
        <Link href="/modules" className="text-[#2C282B] underline">
          Go to Training
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#2C282B]">Supervisor - Trainees</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="rounded-full bg-[#ffc84e] px-5 py-2 text-sm font-semibold text-black hover:bg-[#ffb81c]"
        >
          + Invite Trainee
        </button>
      </div>
      <p className="text-gray-600 mb-6">Select a trainee to review modules, responses, and grading status.</p>

      {fetchError ? <p className="text-red-600 mb-4">{fetchError}</p> : null}
      {fetchSuccess ? <p className="text-green-700 mb-4">{fetchSuccess}</p> : null}

      {trainees.length === 0 ? (
        <p className="text-gray-500">No active trainees found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainees.map((trainee) => {
            const progressPercentage = trainee.totalModules > 0
              ? (trainee.completedModules / trainee.totalModules) * 100
              : 0;

            const isInvitation = trainee.status === "pending" || trainee.status === "expired";

            // Determine if card should be clickable
            const isClickable = !isInvitation;

            return (
              <div
                key={trainee.id}
                className={`block rounded-lg border border-gray-200 bg-white p-5 ${
                  isClickable ? "hover:shadow-md transition-shadow" : "opacity-75"
                }`}
              >
                {isClickable ? (
                  <Link href={`/supervisor/trainees/${trainee.id}`}>
                    <h2 className="text-lg font-semibold text-[#2C282B]">
                      {trainee.name || trainee.email}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-lg font-semibold text-[#2C282B]">
                    {trainee.name || trainee.email}
                  </h2>
                )}

                <p className="text-sm text-gray-600 mt-1">{trainee.email}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-500">Role: {trainee.role}</p>
                  {trainee.status === "pending" && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      Pending invitation
                    </span>
                  )}
                  {trainee.status === "disabled" && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                      Disabled
                    </span>
                  )}
                  {trainee.status === "expired" && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                      Expired
                    </span>
                  )}
                </div>

                {!isInvitation ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Training Progress</span>
                      <span className="font-semibold">
                        {trainee.completedModules} / {trainee.totalModules} modules
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => openManageModal(trainee)}
                        className="rounded-full bg-[#ffc84e] px-4 py-2 text-sm font-semibold text-black hover:bg-[#ffb81c]"
                      >
                        Manage User
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={() => handleResend(trainee.invitationId!)}
                      disabled={resending[trainee.invitationId!]}
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {resending[trainee.invitationId!] ? "Sending..." : "Resend Invitation"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-[#2C282B] mb-4">Invite New Trainee</h2>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteForm({ name: "", email: "" });
                  }}
                  className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="rounded-full bg-[#ffc84e] px-5 py-2 text-sm font-semibold text-black hover:bg-[#ffb81c] disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageModal && selectedTrainee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-[#2C282B] mb-2">Manage Trainee</h2>
            <p className="text-sm text-gray-600 mb-4">{selectedTrainee.email}</p>

            <div className="mb-4">
              <label htmlFor="manage-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="manage-name"
                type="text"
                value={manageName}
                onChange={(e) => setManageName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="mb-6 flex items-center justify-between rounded-md border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Account status</p>
                <p className="text-xs text-gray-500">
                  {manageActive ? "Enabled (can access platform)" : "Disabled (blocked from API access)"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManageActive((prev) => !prev)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  manageActive
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {manageActive ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={sendingReset}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingReset ? "Sending reset email..." : "Send Password Reset Email"}
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeManageModal}
                className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTrainee}
                disabled={savingManage}
                className="rounded-full bg-[#ffc84e] px-5 py-2 text-sm font-semibold text-black hover:bg-[#ffb81c] disabled:opacity-50"
              >
                {savingManage ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
