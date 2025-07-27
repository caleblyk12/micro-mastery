import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { useNavigate } from "react-router-dom";


interface Profile {
  id: string;
  username: string;
}

function SearchFriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [userId, setUserId] = useState("");
  const [friendStatuses, setFriendStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    async function getCurrentUserId() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      setUserId(data.user.id);
      fetchFriendStatuses(data.user.id);
    }
    getCurrentUserId();
  }, []);

  async function fetchFriendStatuses(currentId: string) {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("sender_id, receiver_id, status")
      .or(`sender_id.eq.${currentId},receiver_id.eq.${currentId}`);

    if (!error && data) {
      const statusMap: Record<string, string> = {};

      data.forEach((r) => {
        const isOutgoing = r.sender_id === currentId;
        const otherId = isOutgoing ? r.receiver_id : r.sender_id;

        if (r.status === "accepted") {
          statusMap[otherId] = "accepted";
        } else if (isOutgoing && r.status === "pending") {
          statusMap[otherId] = "pending";
        }
      });

      setFriendStatuses(statusMap);
    }
  }

  async function handleSearch() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", `%${searchTerm}%`)
      .neq("id", userId); // exclude self

    if (!error && data) {
      setResults(data); // even if empty
    }
    setLoading(false);
  }

  async function sendFriendRequest(receiverId: string) {
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: userId,
      receiver_id: receiverId,
      status: "pending",
    });

    if (!error) {
      alert("Friend request sent!");
      setFriendStatuses((prev) => ({
        ...prev,
        [receiverId]: "pending",
      }));
    } else {
      console.error("❌ Failed to send request:", error);
      alert("Failed to send friend request: " + error.message);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <button
        onClick={() => navigate("/nav/friends")}
        className="fixed top-20 left-6 z-40 bg-black text-white font-medium px-4 py-2 rounded-full hover:bg-gray-800"
      >
        ← Back
      </button>
      
      <h2 className="text-3xl font-bold mb-6 text-center">Search Friends</h2>

      <div className="flex mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border rounded-l px-4 py-2"
          placeholder="Search by username"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-800"
        >
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}

      {!loading && results.length === 0 && searchTerm && (
        <p className="text-center text-gray-500">No users found.</p>
      )}

      <ul className="space-y-4">
        {results.map((user) => (
          <li
            key={user.id}
            className="flex justify-between items-center border rounded px-4 py-2"
          >
            <span>{user.username}</span>
            {friendStatuses[user.id] === "accepted" ? (
              <span className="text-green-600">Friend Added</span>
            ) : friendStatuses[user.id] === "pending" ? (
              <span className="text-gray-500">Request Sent</span>
            ) : (
              <button
                onClick={() => sendFriendRequest(user.id)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-800"
              >
                Add Friend
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchFriendsPage;