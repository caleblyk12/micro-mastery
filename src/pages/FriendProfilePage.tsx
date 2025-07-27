import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { ALL_ACHIEVEMENTS } from "../helpers/Achievements";
import placeholder from "../assets/placeholder-avatar.jpg";

function FriendProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [friendProfile, setFriendProfile] = useState<any>(null);
  const [learnedSkills, setLearnedSkills] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      const { data: session } = await supabase.auth.getUser();
      const currentUserId = session?.user?.id;
      if (!currentUserId) return;

      // Check if friendship exists in either direction
      const { data: friendCheck1 } = await supabase
        .from("friends")
        .select()
        .match({ user_id: currentUserId, friend_id: id, status: "accepted" });

      const { data: friendCheck2 } = await supabase
        .from("friends")
        .select()
        .match({ user_id: id, friend_id: currentUserId, status: "accepted" });

      const isFriend =
        (friendCheck1 && friendCheck1.length > 0) ||
        (friendCheck2 && friendCheck2.length > 0);

      if (!isFriend) {
        setFriendProfile(null);
        setLoading(false);
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, level, points, curr_streak")
        .eq("id", id)
        .single();
      setFriendProfile(profile);

      // Fetch avatar
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(`${id}-avatar`, 300);

      if (signedUrlError) {
        console.warn("Failed to load avatar for friend:", signedUrlError.message);
        setAvatarUrl(null);
      } else {
        setAvatarUrl(signedUrlData?.signedUrl ?? null);
      }

      // Fetch skills
      const { data: skillsData } = await supabase
        .from("users_learned_skills")
        .select("learned_at, skills(id, title, categories(title))")
        .eq("user_id", id);
      setLearnedSkills(skillsData || []);

      // Fetch achievements
      const { data: unlockedData } = await supabase
        .from("achievements_unlocked")
        .select("achievement_id")
        .eq("user_id", id);
      const unlockedIds = unlockedData?.map((row) => row.achievement_id) || [];
      const matchedAchievements = ALL_ACHIEVEMENTS.filter((a) =>
        unlockedIds.includes(a.id)
      );
      setAchievements(matchedAchievements);

      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-12 text-gray-500">Loading friend profile...</div>;
  }

  if (!friendProfile) {
    return <div className="text-center mt-12 text-red-600">Friend not found or access denied.</div>;
  }

  const xp = friendProfile.points % 100;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate("/nav/friends")}
        className="fixed top-20 left-6 z-40 bg-black text-white font-medium px-4 py-2 rounded-full hover:bg-gray-800"
      >
        ← Back
      </button>

      <div className="flex justify-center mb-6">
        <img
          src={avatarUrl || placeholder}
          alt="Friend avatar"
          className="w-32 h-32 rounded-full border border-gray-300 object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold mb-2">@{friendProfile.username}</h1>

      <div className="bg-white shadow-md rounded-xl p-4 border mb-4">
        <p className="text-lg font-semibold text-black">Level: {friendProfile.level}</p>
        <p className="text-lg font-semibold text-gray-500">Current XP:</p>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${xp}%` }}></div>
        </div>
        <p className="mt-2 text-gray-600">🔥 {friendProfile.curr_streak}-day streak</p>
      </div>

      {/* Achievements */}
      <div className="bg-white shadow-md rounded-xl p-4 border mb-6">
        <h2 className="text-xl font-bold mb-3">Achievements</h2>
        {achievements.length === 0 ? (
          <p className="text-gray-500">No achievements yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="relative group">
                <div className="p-2 rounded-xl border shadow text-sm font-medium bg-blue-100 border-blue-500 text-blue-800">
                  {a.title}
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 max-w-[200px] text-center">
                  {a.desc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learned Skills */}
      <div className="bg-white shadow-md rounded-xl p-4 border">
        <h2 className="text-xl font-bold mb-3">Learned Skills</h2>
        {learnedSkills.length === 0 ? (
          <p className="text-gray-500">No skills learned yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {learnedSkills.map((s) => (
              <div key={s.skills.id} className="p-4 rounded-lg shadow border w-64 bg-white">
                <p className="text-sm text-gray-500">
                  Category: {s.skills?.categories?.title || "Unknown"}
                </p>
                <p className="font-bold text-lg">
                  {s.skills?.title || "Unknown Skill"}
                </p>
                <p className="text-sm text-gray-500">
                  Learned on: {new Date(s.learned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendProfilePage;
