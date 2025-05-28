import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../helpers/supabaseClient";

function RegistrationPage() {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        const {error} = await supabase.auth.signUp({email: email, password: password});
        setEmail('');
        setPassword('');

        if (error) {
            console.error('error signing up', error.message);
            setErrorMessage(error.message);
        } else {
            setLoading(false);
            setErrorMessage('');
            navigate('/registered')
        }
    }

    return(
        <div className='flex flex-col items-center pt-[100px] gap-2'>
            <h2 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8'>Register and start learning</h2>

            {(errorMessage !== '') && <strong>{errorMessage}</strong> } 

            <input className='input-default' placeholder='Email...' value={email} type='email' onChange={(e) => setEmail(e.target.value)} required/> 
            <input className='input-default' placeholder="Password..." value={password} type='password' onChange={(e) => setPassword(e.target.value)} required/> 
            <button className='button-default mb-8' onClick={() => {setLoading(true); handleRegister()}}>Register</button> 

            {(loading) && <><strong>Loading...</strong></>}

            <span>Already an active Micro-Master? </span>
            <Link className='text-blue-700 hover:text-blue-300' to='/login'>Login</Link>
        </div>
    );
}

export default RegistrationPage;