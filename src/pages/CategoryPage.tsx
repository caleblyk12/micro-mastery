import {useParams, Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../helpers/supabaseClient';
import { useNavigate } from 'react-router-dom';


export interface Skill {
    id: number,
    title: string,
    video_url: string,
    category_id: number
}

function CategoryPage() {
    const navigate = useNavigate();
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

      return (
        <div className="min-h-screen bg-white text-black px-4 py-6">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                {/* Back Button */}
                <button
                onClick={() => navigate('/nav/categories')}
                className="self-start mb-6 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                ← Back to Categories
                </button>

                {/* Category Header */}
                <h1 className="text-3xl font-bold mb-6">{catHeader}</h1>

                {/* Skills List */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {skills.map((skill) => (
                    <Link
                    key={skill.id}
                    to={`/nav/skill/${skill.id}`}
                    className="flex flex-col justify-between bg-gray-100 hover:bg-gray-200 text-black  py-4 px-6 rounded-2xl shadow-md transition-colors duration-200 ease-in-out cursor-pointer text-lg font-medium text-center"
                    >
                        <p className='mb-2'>{skill.title}</p>
                    </Link>
                ))}
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;