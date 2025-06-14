import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import SkillCard from "../components/SkillCard";
import placeholder from '../assets/placeholder-avatar.jpg'
import { Trash2 } from "lucide-react";
import { ALL_ACHIEVEMENTS } from "../helpers/Achievements";


interface RawSkillData {
  learned_at: string;
  skills: {
    id: number;
    title: string;
    categories: {
      title: string;
    }
  }
}

interface SkillItem {
    date_learned: string,
    skill_id: number
    skill_title: string,
    category_title: string
}

function ProfilePage() {

    const [userId, setUserId] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [joinedDate, setJoinedDate] = useState<string>('')
    const [learnedSkills, setLearnedSkills] = useState<SkillItem[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [dailyStreak, setDailyStreak] = useState<number>(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([]);
    const [level, setLevel] = useState<number>(0);
    const [xp, setXP] = useState<number>(0);


    async function fetchLevelDetails(userId: string) {
        const {data: levelData, error: levelError} = await supabase.from('profiles').select('level').eq('id', userId).single();
        const {data: xpData, error:xpError} = await supabase.from('profiles').select('points').eq('id', userId).single();
        
        if(levelError || !levelData){
            console.error('error retrieving level', levelError.message);
            setErrorMessage('Couldnt retrieve user level');
            return;
        }

        if(xpError || !xpData) {
            console.error('Error retrieving xp points', xpError.message);
            setErrorMessage('Couldnt retrieve XP points');
            return;
        }

        setLevel(levelData.level);
        setXP(xpData.points % 100);
    }

    async function fetchUnlockedAchievements(userId: string) {
        const { data, error } = await supabase
            .from("achievements_unlocked")
            .select("achievement_id")
            .eq("user_id", userId);

        if (error) {
            console.error("Failed to fetch unlocked achievements:", error.message);
            setErrorMessage(error.message);
            return;
        }

        const ids = data.map((row) => row.achievement_id);
        setUnlockedAchievements(ids);
    }

    async function checkAndUnlockAchievements(userId: string, skills: SkillItem[], streak: number, unlocked: number[]) {
        for (const achievement of ALL_ACHIEVEMENTS) {
            const alreadyUnlocked = unlocked.includes(achievement.id);
            const meetsCondition = achievement.condition(skills, streak);

            if (!alreadyUnlocked && meetsCondition) {
            const { error } = await supabase.from("achievements_unlocked").insert({
                user_id: userId,
                achievement_id: achievement.id,
            });

            if (error) {
                console.error("Error unlocking achievement:", error.message);
            } else {
                setUnlockedAchievements((prev) => [...prev, achievement.id]);
            }
            }
        }
    }


    async function handleDeleteAvatar() {
        if (!userId) return;

        const filePath = `${userId}-avatar`;

        const { error } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

        if (error) {
            setErrorMessage('Failed to delete avatar: ' + error.message);
            return;
        }

        setAvatarUrl(null);
    }
    


    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file || userId === '') return;

        const filePath = `${userId}-avatar`;

        const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {upsert: true});

        if (uploadError) {
            setErrorMessage('Failed to upload avatar: ' + uploadError.message);
            return;
        }

        // Get the public URL of the uploaded avatar
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(filePath, 60); // URL valid for 60 seconds

        if (signedUrlError) {
            console.error('Failed to generate avatar URL: ' + signedUrlError.message);
            setErrorMessage('Failed to generate avatar URL: ' + signedUrlError.message);
            return;
        }

        setAvatarUrl(signedUrlData?.signedUrl ?? null);
    }

    function calculateDailyStreak(learnedSkills: SkillItem[]): number {
        if (learnedSkills.length === 0) {
            //debugger
            console.log('returning early because nth learnt');
            return 0; // No skills learned, streak is zero
        }

        //Extract unique learning dates as YYYY-MM-DD strings
        const datesSet = new Set(
            learnedSkills.map(skill => {
            const d = new Date(skill.date_learned);
            return d.toLocaleDateString('en-CA'); 
            })
        );

        // Convert set to array and sort newest to oldest
        const dates = Array.from(datesSet).sort((a, b) => (a < b ? 1 : -1));
        //debugger
        console.log(dates);

        //Get today's date string for comparison
        const today = new Date();
        const todayStr = today.toLocaleDateString('en-CA');

        // Check if user learned something today or yesterday (start point)
        // If no learning on today or yesterday, streak is 0
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
            //debugger
            console.log('returning because nth learnt tdy or ytd');
            return 0;
        }

        // Step 4: Count streak
        let streak = 1; // count first day
        //debugger
        console.log('streak set to 1');
 
        for (let i = 1; i < dates.length; i++) {
            //debugger
            console.log('entering for loop');
            // Calculate difference in days between current and previous date
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);

            const diffInTime = prevDate.getTime() - currDate.getTime();
            const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

            if (diffInDays === 1) {
                streak++; // consecutive day, increase streak
            } else {
                break; // streak broken, stop counting
            }
        }

        console.log("Raw date_learned:", learnedSkills[0]?.date_learned);
        console.log("Parsed dates:", dates);

        return streak;
    }

    //useEffect for getting and setting user data locally on mount
    useEffect(() => {
        async function fetchUser() {
            const {data: userData, error: userError} = await supabase.auth.getUser();
            if(userError) {
                console.error('error fetching user', userError.message);
                setErrorMessage(userError.message);
                setLoading(false);
                return;
            } else if (!userData || !userData.user.email || !userData.user.created_at) {
                console.error('no authenticated user found');
                setErrorMessage('No authenticated User found');
                setLoading(false);
                return;
            } 
            setUserId(userData.user.id);
            setUsername(userData.user.email.split('@')[0]);
            setJoinedDate(new Date(userData.user.created_at).toLocaleDateString());
        }

        fetchUser();
    }, [])


    //useEffect for avatar stuff
    useEffect(() => {
        if (!userId) return;

        async function checkAvatarExists() {
            const { data: files, error } = await supabase
                .storage
                .from('avatars')
                .list('', { search: `${userId}-avatar` });

            if (error) {
                console.error("Error checking avatar:", error.message);
                setErrorMessage(error.message);
                return;
            }

            const fileExists = files?.some(file => file.name === `${userId}-avatar`);
            if (fileExists) {
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from('avatars')
                    .createSignedUrl(`${userId}-avatar`, 60);

                if (signedUrlError) {
                    console.error("Error generating signed URL:", signedUrlError.message);
                    setErrorMessage(signedUrlError.message);
                    return;
                }

                setAvatarUrl(signedUrlData?.signedUrl ?? null);
            } else {
                setAvatarUrl(null); 
            }
        }

        checkAvatarExists();
    }, [userId]);



    //useEffect for fetching learned skills, achievements and formatting it in local storage on mount
    useEffect(() => {
        if (userId === '') return; 
        //debugger
        console.log("Fetching learned skills...");
        async function fetchLearnedSkills() {
            const { data: skillData, error: skillError } = await supabase
            .from('users_learned_skills')
            .select('learned_at, skills(id, title, categories(title))')
            .eq('user_id', userId);

            if (skillError) {
                console.error('Error fetching skills:', skillError.message);
                setErrorMessage(skillError.message);
            } else {
                //debugger
                console.log("Fetched skills:", skillData);
                const formattedSkills = (skillData as unknown as RawSkillData[])
                    .map((x) => ({
                        date_learned: x.learned_at,
                        skill_id: x.skills.id,
                        skill_title: x.skills.title,
                        category_title: x.skills.categories.title
                }))
                setLearnedSkills(formattedSkills);
            }
            await fetchUnlockedAchievements(userId);
            await fetchLevelDetails(userId);
            setLoading(false);
        }

        fetchLearnedSkills();
        
    }, [userId]); 


    //streak useEffect (everytime learnedSkills changes, update streak and achievements)
    useEffect(() => {
        //debugger
        console.log('entering streak useEffect');
        if (learnedSkills.length === 0) {
            setDailyStreak(0);
            return;
        }
        //debugger
        console.log('calling calcstreak function');
        const streak = calculateDailyStreak(learnedSkills);
        setDailyStreak(streak);

        (async () => {
            const { error } = await supabase.from('profiles').update({ curr_streak: streak }).eq('id', userId);
            if (error) console.error('error updating profile streak', error.message);
            await checkAndUnlockAchievements(userId, learnedSkills, streak, unlockedAchievements);
        })();

    }, [learnedSkills, userId]);




    if(loading) {
        return(
            <div className='flex flex-col items-center'>
                <h2 className='text-5xl font-bold'>Loading profile...</h2>
            </div>
        );
    } 
    
    return(
        <div className="p-6 max-w-4xl mx-auto">
            {errorMessage && <strong>{errorMessage}</strong>}

            {/*levelling stuff */}
            <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md border mb-[40px] border-gray-200">
                <p className="text-lg font-semibold text-black">Level: {level}</p>
                <p className="text-lg font-semibold text-gray-500">Current XP: </p>
                
                {/*xp bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${xp}%` }}
                    ></div>
                </div>
            </div>

            {/* Profile Picture Placeholder */}
            <div className="flex flex-col items-center mb-4">
                <div className="relative w-48 h-48 md:w-40 md:h-40">
                    <img
                        src={avatarUrl || placeholder}
                        className="w-full h-full object-cover rounded-full border border-gray-300"
                    />
                    
                    {avatarUrl && (
                        <button
                        onClick={handleDeleteAvatar}
                        className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                        title="Delete Photo"
                        >
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                    )}
                </div>

                <label className="text-sm mb-4 font-medium text-blue-700 cursor-pointer">
                    Change Photo
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>
                {/*name, basic info */}
                <h2 className="text-3xl font-bold">{username}</h2>
                <p className="text-gray-500">Joined on: {joinedDate}</p>
                
            </div>

            {/*streak*/}
            <div className="mb-[10%] text-white text-2xl text-center font-semibold bg-black rounded-4xl py-2">
                Current Learning Streak: {dailyStreak} {dailyStreak === 1 ? 'day' : 'days'}
            </div>


            {/* Skills */}
            <h3 className="text-2xl font-bold mb-4 text-center">Learned Skills</h3>
            {learnedSkills.length === 0 ? (
                <p className='text-center'>No skills learnt yet... we all start somewhere!</p>
            ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                    {learnedSkills.map((s) => (
                        <SkillCard
                        key={s.skill_id}
                        title={s.skill_title}
                        category={s.category_title}
                        date={s.date_learned}
                        />
                    ))}
                </div>
            )}


            {/* Achievements */}
            <div className="my-6 mt-[70px]">
                <h3 className="text-2xl font-bold text-center mb-4">Achievements</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                    {ALL_ACHIEVEMENTS.map((a) => (
                        <div key={a.id} className="relative group">
                            <div
                            className={`p-3 rounded-xl border shadow-md text-sm font-medium ${
                                unlockedAchievements.includes(a.id)
                                ? "bg-blue-100 border-blue-500 text-blue-800"
                                : "bg-gray-100 text-gray-400 border-gray-300"
                            }`}
                            >
                                {a.title}
                            </div>

                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 max-w-[200px] text-center">
                                {a.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    </div>
  );
}

export default ProfilePage;