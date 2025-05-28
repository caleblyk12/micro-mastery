import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../helpers/supabaseClient";

function LoginPage() {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        const {error} = await supabase.auth.signInWithPassword({email: email, password: password});
        
        setEmail('');
        setPassword('');

        if (error) {
            console.error('error signing in', error.message);
            setErrorMessage(error.message);
            setLoading(false);
        } else {
            setLoading(false);
            setErrorMessage('');
            navigate('/nav/home')
        }
        
    }

    return(
        <div className='flex flex-col items-center pt-[100px] gap-2'>
            <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8'>Login and continue learning</h1>

            {(errorMessage !== '') && <strong>{errorMessage}</strong> } 

            <input className='input-default' placeholder='Email...' value={email} type='email' onChange={(e) => setEmail(e.target.value)} required/> 
            <input className='input-default' placeholder="Password..." value={password} type='password' onChange={(e) => setPassword(e.target.value)} required/> 
            <button className='button-default mb-8' onClick={() => {setLoading(true); handleLogin();}}>Login</button> 

            {loading && <strong>Loading...</strong>}

            <span>Don't have a Micro-Mastery account yet? </span>
            <Link className='text-blue-700 hover:text-blue-300' to='/register'>Register</Link>
        </div>
    );
}

export default LoginPage;