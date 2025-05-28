import { useNavigate } from "react-router-dom";
import dogImage from '../assets/orbitalDog256.png';

function StartPage() {

    const navigate = useNavigate();

    return(
        <div className='flex flex-col justify-center items-center pt-10'>
            <h1 className='text-[50px] mb-20'>Welcome to <strong>Micro-Mastery</strong></h1>
            <img src={dogImage}/> <br/>
            <div className='flex justify-between w-full max-w-[600px] px-4 gap-8'>
                <div className=''>
                    <div className='text-[30px]'>New to Micro-Mastery?</div>
                    <button className='button-default text-[20px]' onClick={() => navigate('/register')}>Register</button>
                </div>
                 
                <div className=''>
                    <div className='text-[30px]'>Returning to smash your goals?</div>
                    <button className='button-default text-[20px]' onClick={() => navigate('/login')}>Log in</button>
                </div>
                
            </div>
            
        </div>
    );
}

export default StartPage;