import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";

function SettingsPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUsername() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setMessage("Unable to load user session.");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUsername(profileData.username);
      } else {
        setMessage("Failed to fetch username.");
      }
    }

    fetchUsername();
  }, []);

  async function handleSave() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      setMessage("User session not found. Please log in again.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to update username.");
    } else {
      setMessage("Username updated successfully.");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <label className="block mb-2 font-medium">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border px-4 py-2 rounded w-full"
      />
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
      {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
    </div>
  );
}

export default SettingsPage;
