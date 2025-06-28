import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";

function FriendRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      const { data: session } = await supabase.auth.getUser();
      const currentUserId = session?.user?.id;
      if (!currentUserId) return;


      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, sender_id, profiles:sender_id(username, level, points)")
        .eq("receiver_id", currentUserId)
        .eq("status", "pending");

      if (!error && data) {
        setRequests(data);
      } else {
        console.error("Error fetching friend requests:", error?.message);
      }
    }

    fetchRequests();
  }, []);

  const respondToRequest = async (requestId: number, action: "accept" | "reject") => {
    try {
      setLoadingId(requestId);

      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: action === "accept" ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (updateError) {
        console.error("Failed to update request:", updateError.message);
        return;
      }

      console.log(`Friend request ${requestId} ${action}ed`);

      // Automatically handled by SQL trigger if using trigger setup
      // If not using trigger, you’d insert into `friends` table here

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">👋 Friend Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">No friend requests at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{req.profiles.username}</p>
                <p className="text-sm text-gray-600">
                  Level {req.profiles.level} · XP {req.profiles.points % 100}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  disabled={loadingId === req.id}
                  onClick={() => respondToRequest(req.id, "accept")}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  disabled={loadingId === req.id}
                  onClick={() => respondToRequest(req.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FriendRequestsPage;
