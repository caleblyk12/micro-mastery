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

    return(
        <div>
            {categories.map((cat) => 
                <div key={cat.id}>
                    <button onClick={() => navigate(`/nav/category/${cat.id}`)}>{cat.title}</button>
                </div>
            )}
        </div>
    );
}

export default CategoriesPage;