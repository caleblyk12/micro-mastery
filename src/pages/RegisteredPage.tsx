import { useNavigate } from "react-router-dom";

function RegisteredPage() {

    const navigate = useNavigate();

    return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-4xl font-bold mb-2 text-black">Registration Successful</h2>
        <h4 className="text-gray-600 mb-6">Check your email for a confirmation link!</h4>
        <button onClick={() => navigate('/')} className="button-default">
            Back to Start
        </button>
    </div>
);

}

export default RegisteredPage;