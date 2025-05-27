import { useNavigate } from "react-router-dom";

function StartPage() {

    const navigate = useNavigate();

    return(
        <div>
            <h1>Welcome to <strong>Micro-Mastery</strong></h1>
            <img src='./assets/orbitalDog256.png'/> <br/>

            <span>New to Micro-Mastery?</span>
            <button onClick={() => navigate('/register')}>Register</button> <br/>

            <span>Returning to smash your goals?</span>
            <button onClick={() => navigate('/login')}>Log in</button>
        </div>
    );
}

export default StartPage;