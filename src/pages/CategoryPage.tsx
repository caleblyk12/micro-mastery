import {useParams, Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../helpers/supabaseClient';


export interface Skill {
    id: number,
    title: string,
    video_url: string,
    category_id: number
}

function CategoryPage() {

    const {id} = useParams();
    const[skills, setSkills] = useState<Skill[]>([]);
    const[catHeader, setCatHeader] = useState('');

    useEffect(() => {
        async function fetchSkills() {
            const {data, error} = await supabase.from('skills').select('*').eq('category_id', id);
            if (error) {
                console.error('error fetching skills', error.message);
            } else {
                setSkills(data);
            }
        }

        fetchSkills();

        async function fetchCatTitle() {
            const {data, error} = await supabase.from('categories').select('title').eq('id', id).single();
            if(error) {
                console.error('error fetching category title', error.message);
            } else {
                setCatHeader(data.title);
            }
        }

        fetchCatTitle();
    }, [id])

    return(
        <div>
            <h1>{catHeader}</h1>
            {skills.map((skill) => 
                <div key={skill.id}>
                    <Link to={`/nav/skill/${skill.id}`}>{skill.title}</Link>
                </div>
            )}
        </div>
    );
}

export default CategoryPage;