import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../helpers/supabaseClient";

function LoginPage() {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    async function handleLogin() {
        const {error} = await supabase.auth.signInWithPassword({email: email, password: password});
        
        setEmail('');
        setPassword('');

        if (error) {
            console.error('error signing in', error.message);
            setErrorMessage(error.message);
        } else {
            setErrorMessage('');
            navigate('/nav/home')
        }
    }

    return(
        <div>
            <h2>Login</h2>

            {(errorMessage !== '') && <strong>{errorMessage}</strong> } <br/>

            <input placeholder='Email...' value={email} type='email' onChange={(e) => setEmail(e.target.value)} required/> <br/>
            <input placeholder="Password..." value={password} type='password' onChange={(e) => setPassword(e.target.value)} required/> <br/>
            <button onClick={handleLogin}>Login</button> <br/>

            <span>Don't have an account yet? </span>
            <Link to='/register'>Register</Link>
        </div>
    );
}

export default LoginPage;