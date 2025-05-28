import { useEffect, useState } from "react";
import { supabase } from "../helpers/supabaseClient";

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
    const [learnedSkills, setLearnedSkills] = useState<SkillItem[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchUser() {
            const {data: userData, error: userError} = await supabase.auth.getUser();
            if(userError) {
                console.error('error fetching user', userError.message);
                setErrorMessage(userError.message);
                setLoading(false);
                return;
            } else if (!userData || !userData.user.email) {
                console.error('no authenticated user found');
                setErrorMessage('No authenticated User found');
                setLoading(false);
                return;
            } 
            setUserId(userData.user.id);
            setUsername(userData.user.email.split('@')[0]);
        }

        fetchUser();
    }, [])

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


    if(loading) {
        return(
            <div>
                <h2>Loading profile...</h2>
            </div>
        );
    } else if (learnedSkills.length === 0){
        return(
            <div>
                {errorMessage && <strong>{errorMessage}</strong>}
                <h2>{username}</h2>
                <p>No skills learnt yet...we all start somewhere!</p>
            </div>
        );
    } else {
        return(
            <div>
                {errorMessage && <strong>{errorMessage}</strong>}
                <h2>{username}</h2>
                <h2>Learned Skills:</h2>
                {learnedSkills.map((s) => 
                    <div key={s.skill_id}>
                        <p>Category: {s.category_title}</p>
                        <p>{s.skill_title}</p>
                        <p>Learned at: {s.date_learned}</p>
                    </div>
                )}
            </div>
        );
    }
}

export default ProfilePage;