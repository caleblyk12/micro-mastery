import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";

interface Profile {
  id: string;
  username: string;
}

function SearchFriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [userId, setUserId] = useState("");
  const [friendRequests, setFriendRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getCurrentUserId() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      setUserId(data.user.id);
      fetchSentRequests(data.user.id);
    }
    getCurrentUserId();
  }, []);

  async function fetchSentRequests(currentId: string) {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("receiver_id")
      .eq("sender_id", currentId)
      .in("status", ["pending", "accepted"]); // ignore rejected

    if (!error && data) {
      setFriendRequests(data.map((r) => r.receiver_id));
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
      setResults(data);
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
      setFriendRequests((prev) => [...prev, receiverId]);
    } else {
      console.error("❌ Failed to send request:", error);
      alert("Failed to send friend request: " + error.message);
    }
  }


  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
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

      <ul className="space-y-4">
        {results.map((user) => (
          <li
            key={user.id}
            className="flex justify-between items-center border rounded px-4 py-2"
          >
            <span>{user.username}</span>
            {friendRequests.includes(user.id) ? (
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