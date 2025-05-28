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
        <div>
            <h2>Register</h2>

            {(errorMessage !== '') && <strong>{errorMessage}</strong> } <br/>

            <input placeholder='Email...' value={email} type='email' onChange={(e) => setEmail(e.target.value)} required/> <br/>
            <input placeholder="Password..." value={password} type='password' onChange={(e) => setPassword(e.target.value)} required/> <br/>
            <button onClick={() => {setLoading(true); handleRegister()}}>Register</button> <br/>

            {(loading) && <><strong>Loading...</strong><br/></>}

            <span>Already have an account? </span>
            <Link to='/login'>Login</Link>
        </div>
    );
}

export default RegistrationPage;