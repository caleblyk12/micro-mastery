import { useState, useEffect } from "react";
import { supabase } from "../helpers/supabaseClient";

function HomePage() {

    const [username, setUsername] = useState('Default User');

    useEffect(() => {
        async function fetchUsername() {
            const {data, error} = await supabase.auth.getUser();
            if(error) {
                console.error('error fetching username', error.message);
            } else {
                if(data && data.user && data.user.email) {
                    setUsername(data.user.email.split('@')[0]);
                } else {
                    console.error('missing data from user');
                }
            }
        }

        fetchUsername();
    }, [])

    return(
        <div className='flex flex-col gap-4 items-center mt-[50px]'>
            <h1 className='text-5xl'>Welcome back <span className='font-bold'>{username}</span></h1>
            <p></p>
        </div>
    );
}

export default HomePage;