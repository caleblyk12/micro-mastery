import {useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { supabase } from '../helpers/supabaseClient';

export interface Category {
    id: number,
    title: string
}

function CategoriesPage() {

    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);


    useEffect(() => {
        async function fetchCategories() {
            const {data, error} = await supabase.from('categories').select('*');

            if(error){
                console.error('error fetching categories', error.message);
            } else {
                setCategories(data);
            }
        };

        fetchCategories();
    }, [])

    return (
        <div className="min-h-screen bg-white text-black px-4 py-6">
            <div className="max-w-4xl mx-auto flex flex-col items-center">

                {/* Page Title */}
                <h1 className="text-3xl font-bold mb-6">Categories</h1>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {categories.map((cat) => (
                    <button
                    key={cat.id}
                    onClick={() => navigate(`/nav/category/${cat.id}`)}
                    className="bg-black hover:bg-gray-50 text-white hover:text-black py-4 px-6 rounded-2xl shadow-md transition-colors duration-200 ease-in-out cursor-pointer text-lg font-medium"
                    >
                    {cat.title}
                    </button>
                ))}
                </div>
            </div>
        </div>
    );
}

export default CategoriesPage;