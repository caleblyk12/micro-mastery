 import { useParams, useNavigate } from "react-router-dom";
 import {useEffect, useState} from 'react';
 import { supabase } from "../helpers/supabaseClient";
 import type { Skill } from "./CategoryPage";

function SkillPage() {

    const {id} = useParams();
    const navigate = useNavigate();
    const [skill, setSkill] = useState<Skill | null>(null);

    useEffect(() => {
        async function fetchSkill() {
            const {data, error} = await supabase.from('skills').select('*').eq('id', id).single();
            if(error) {
                console.error('error fetching skill', error.message);
            } else {
                setSkill(data);
            }
        }

        fetchSkill();
    }, [id])


    async function handleDone() {
        if (!skill) return;

        const { data: userData, error: getUserError } = await supabase.auth.getUser();
        
        if(getUserError) {
            console.error('error fetching user id', getUserError.message);
            return;
        } else if (!userData) {
            console.error('no authenticated user found');
            return;
        }

        const{error} = await supabase.from('users_learned_skills').insert({
            user_id: userData.user.id,
            skill_id: skill.id
        })

        if (error && error.message === 'duplicate key value violates unique constraint "users_learned_skills_pkey"') {
            console.error('ignore this error, skill data was not overwritten and user redirected')
            navigate('/nav/home');
        }
        else if (error) {
            console.error('error inserting user learnt skill', error.message);
        } else {
            navigate('/nav/home');
        }
        
    }

    return(
        <>
        {skill ? 
            <div>
                <h1>{skill.title}</h1>
                <iframe 
                    width="560" 
                    height="315" 
                    src={skill.video_url} 
                    title={`${skill.title} video tutorial`} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen></iframe>
                
                <br/>
                <button onClick={handleDone}>I'm done</button>
            </div> : 
            
            <h1>Loading...</h1>
        }
        </>
        
        
    );
}

export default SkillPage;