import {useEffect, useState} from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Navigate } from 'react-router-dom';

interface WrapperProps {
    children: ReactNode;
}

function Wrapper({children}: WrapperProps) {

    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const {data} = await supabase.auth.getSession();
            const sess = data.session;

            setAuthenticated(sess !== null);
            setLoading(false);
        }

        getSession();

        //authstatechange function will automatically start listening and executing on changes, and it returns an object that has subscribe n unsubscribe
        //we are renaming this object to auth listener, for purposes of cleanup during unmount
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(session !== null);
        });

        //cleanup
        return () => {
            authListener.subscription.unsubscribe();
        };
        
    }, []);



    if(loading) {
        return <div>Loading...</div>;
    } else{
        if(authenticated){
            return <>{children}</>;
        } else {
            return <Navigate to='/login'/>;
        }
    }
}

export default Wrapper;