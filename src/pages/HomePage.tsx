import { useState, useEffect } from "react";
import { supabase } from "../helpers/supabaseClient";

function HomePage() {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    async function fetchUsername() {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (error || !user) {
        console.error("Failed to fetch user:", error?.message || "No user found");
        return;
      }

      // Fetch username from 'profiles' table first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile && profile.username) {
        setUsername(profile.username);
      } else if (user.email) {
        setUsername(user.email.split("@")[0]);
      } else {
        setUsername("User");
      }

      if (profileError) {
        console.warn("No username in profile, falling back to email prefix.");
      }
    }

    fetchUsername();
  }, []);

  return (
    <div className="flex flex-col items-center mt-[50px] px-4">
      <h1 className="text-5xl text-center mb-[40px]">
        Welcome back <span className="font-bold">{username || "..."}</span>
      </h1>

      <div className="mt-8 max-w-2xl text-center space-y-6 text-gray-700 text-lg leading-relaxed">
        <p>Learning doesn't always have to be hard, time-consuming, or draining.</p>
        <p>
          Here in <span className="font-semibold text-black">Micro-Mastery</span>, you can explore diverse topics
          through our curated categories — all delivered in micro-learning, minutes-long video formats.
        </p>
        <p>
          Log in daily, take 5 minutes to upskill yourself, broaden your horizons, and keep that streak going!
        </p>
        <p className="mb-[70px]">
          Click 'categories' on the navigation bar above and get started today, or 'profile' to view streaks, skills,
          and more.
        </p>
        <p className="bg-blue-200 border border-blue-400 rounded-xl px-4 py-3 text-blue-800 font-medium text-base">
          💡 Note: You MUST get full marks in the post-video MCQ quiz to mark a skill as complete. Feel free to GPT it —
          but remember, you're only cheating yourself and holding back your potential as a micromaster{" "}
          <span className="uppercase font-bold">Big Dawg</span> 🐾
        </p>
      </div>
    </div>
  );
}

export default HomePage;