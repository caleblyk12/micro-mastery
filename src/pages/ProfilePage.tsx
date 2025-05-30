import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";
import SkillCard from "../components/SkillCard";
import placeholder from '../assets/placeholder-avatar.jpg'
import { Trash2 } from "lucide-react";

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
            return 0; // No skills learned, streak is zero
        }

        //Extract unique learning dates as YYYY-MM-DD strings
        const datesSet = new Set(
            learnedSkills.map(skill => {
            const d = new Date(skill.date_learned);
            return d.toISOString().slice(0, 10); 
            })
        );

        // Convert set to array and sort newest to oldest
        const dates = Array.from(datesSet).sort((a, b) => (a < b ? 1 : -1));

        //Get today's date string for comparison
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        // Check if user learned something today or yesterday (start point)
        // If no learning on today or yesterday, streak is 0
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
            return 0;
        }

        // Step 4: Count streak
        let streak = 1; // count first day

        for (let i = 1; i < dates.length; i++) {
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

        return streak;
    }

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

    useEffect(() => {
        if (userId === '') return; 

        async function fetchLearnedSkills() {
            const { data: skillData, error: skillError } = await supabase
            .from('users_learned_skills')
            .select('learned_at, skills(id, title, categories(title))')
            .eq('user_id', userId);

            if (skillError) {
                console.error('Error fetching skills:', skillError.message);
                setErrorMessage(skillError.message);
            } else {
                const formattedSkills = (skillData as unknown as RawSkillData[])
                    .map((x) => ({
                        date_learned: new Date(x.learned_at).toLocaleDateString(),
                        skill_id: x.skills.id,
                        skill_title: x.skills.title,
                        category_title: x.skills.categories.title
                }))
                setLearnedSkills(formattedSkills);
            }
            setLoading(false);
        }

        fetchLearnedSkills();
        
    }, [userId]); 

    useEffect(() => {
        if (learnedSkills.length === 0) {
            setDailyStreak(0);
            return;
        }
        const streak = calculateDailyStreak(learnedSkills);
        setDailyStreak(streak);
    }, [learnedSkills]);




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
                
                <h2 className="text-3xl font-bold">{username}</h2>
                <p className="text-gray-500">Joined on: {joinedDate}</p>
            </div>

            {/*streak*/}
            <div className="mb-[17%] text-white text-2xl text-center font-semibold bg-black rounded-4xl py-2">
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
    </div>
  );
}

export default ProfilePage;