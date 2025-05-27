import { useNavigate } from "react-router-dom";

function RegisteredPage() {

    const navigate = useNavigate();

    return(
        <div>
            <h2>Registration successful</h2>
            <h4>Check your email for a confirmation link!</h4>
            <button onClick={() => navigate('/')}>Back to start</button>
        </div>
    );
}

export default RegisteredPage;