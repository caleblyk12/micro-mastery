import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import { ALL_ACHIEVEMENTS } from "../helpers/Achievements";

function FriendProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [, setUserId] = useState<string>("");
  const [friendProfile, setFriendProfile] = useState<any>(null);
  const [learnedSkills, setLearnedSkills] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Friend ID from route:", id);  // Check this in browser console
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: session } = await supabase.auth.getUser();
      const currentUserId = session?.user?.id;
      if (!currentUserId) return;
      setUserId(currentUserId);

      // Check friendship in both directions
      const { data: friendCheck, error: checkError } = await supabase
        .from("friends")
        .select()
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${currentUserId})`)
        .eq("status", "accepted");

      if (checkError || !friendCheck || friendCheck.length === 0) {
        setFriendProfile(null);
        setLoading(false);
        return;
      }

      // Fetch profile info
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username, level, points, streak")
        .eq("id", id)
        .single();

      if (profileError || !profile) {
        console.error("Profile fetch error:", profileError);
        setLoading(false);
        return;
      }

      setFriendProfile(profile);

      // Fetch learned skills
      const { data: skillsData, error: skillsError } = await supabase
        .from("users_learned_skills")
        .select("skill_id, skills(title)")
        .eq("user_id", id);

      if (skillsError) console.error("Learned skills error:", skillsError);
      setLearnedSkills(skillsData || []);

      // Fetch achievements unlocked
      const { data: unlockedData, error: achievementError } = await supabase
        .from("achievements_unlocked")
        .select("achievement_id")
        .eq("user_id", id);

      if (achievementError) {
        console.error("Achievements fetch error:", achievementError);
        setAchievements([]);
      } else {
        const unlockedIds = unlockedData.map((row) => row.achievement_id);
        const matchedAchievements = ALL_ACHIEVEMENTS.filter((a) =>
          unlockedIds.includes(a.id)
        );
        setAchievements(matchedAchievements);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-12 text-gray-500">Loading friend profile...</div>;
  }

  if (!friendProfile) {
    return <div className="text-center mt-12 text-red-600">Friend not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">@{friendProfile.username}</h1>
      <p className="mb-6 text-gray-700">
        Level {friendProfile.level} · {friendProfile.points} XP · 🔥 {friendProfile.streak}-day streak
      </p>

      <h2 className="text-xl font-semibold mb-2">Achievements</h2>
      {achievements.length === 0 ? (
        <p className="mb-6 text-gray-600">No achievements yet.</p>
      ) : (
        <ul className="mb-6 space-y-2">
          {achievements.map((a) => (
            <li key={a.id} className="text-gray-800">
              <strong>{a.title}</strong>: {a.desc}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mb-2">Learned Skills</h2>
      {learnedSkills.length === 0 ? (
        <p className="text-gray-600">No skills learned yet.</p>
      ) : (
        <ul className="space-y-1">
          {learnedSkills.map((s) => (
            <li key={s.skill_id}>• {s.skills?.title || "Unknown Skill"}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FriendProfilePage;
