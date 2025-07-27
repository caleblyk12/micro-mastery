import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../helpers/supabaseClient";
import placeholder from '../assets/placeholder-avatar.jpg';


interface Friend {
  id: string;
  username: string;
  level: number;
  points: number;
  avatarUrl?: string;
}

function MyFriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFriends() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_accepted_friends", {
        uid: user.id,
      });

      if (error) {
        console.error("Error fetching friends:", error.message);
        setError("Failed to fetch friends.");
        setLoading(false);
        return;
      }

      const friendsWithAvatars: Friend[] = await Promise.all(
        data.map(async (friend: Friend) => {
          const filePath = `${friend.id}-avatar`;
          const { data: avatarData, error: avatarError } = await supabase.storage
            .from("avatars")
            .createSignedUrl(filePath, 60);

          return {
            ...friend,
            avatarUrl: avatarError ? null : avatarData?.signedUrl ?? null,
          };
        })
      );

      setFriends(friendsWithAvatars);
      setLoading(false);
    }


    fetchFriends();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-xl font-semibold">
        Loading friends...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Friends</h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate('/nav/friends/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            🔍 Search Friends
          </button>
          <button
            onClick={() => navigate('/nav/friends/requests')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            📬 Friend Requests
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {friends.length === 0 ? (
        <p className="text-center text-gray-500">You have no friends yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md cursor-pointer flex items-center gap-4"
              onClick={() => navigate(`/nav/friends/${friend.id}`)}
            >
              <img
                src={friend.avatarUrl || placeholder}
                className="w-16 h-16 rounded-full border border-gray-300 object-cover"
                alt={`${friend.username}'s avatar`}
              />
              <div>
                <h2 className="text-xl font-semibold">{friend.username}</h2>
                <p className="text-gray-600">Level: {friend.level}</p>
                <p className="text-gray-600">XP: {friend.points % 100}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyFriendsPage;
