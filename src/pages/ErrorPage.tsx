import { useNavigate } from "react-router-dom"

function ErrorPage() {

    const navigate = useNavigate();

    return(
        <div>
            <h2>Sadly, this page doesn't exist...</h2>
            <h4>But don't let that stop you from learning!</h4>
            <button onClick={() => navigate('/')}>Back to start</button>
        </div>
    )
}

export default ErrorPage;