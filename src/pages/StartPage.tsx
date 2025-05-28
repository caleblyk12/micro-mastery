import { useNavigate } from "react-router-dom";
import dogImage from '../assets/orbitalDog256.png';

function StartPage() {

    const navigate = useNavigate();

    return(
        <div className='flex flex-col justify-center items-center pt-10'>
            <h1 className='text-[50px] mb-20'>Welcome to <strong>Micro-Mastery</strong></h1>
            <img className='mb-[10%]' src={dogImage}/> 
            <div className='flex justify-between w-full max-w-[1200px] px-[10%] gap-8'>
                <div className='flex flex-col items-center'>
                    <div className='text-[25px] mb-[5%]'>New to Micro-Mastery?</div>
                    <button className='button-default text-[20px]' onClick={() => navigate('/register')}>Register</button>
                </div>
                 
                <div className='flex flex-col items-center'>
                    <div className='text-[25px] mb-[5%]'>Returning to smash your goals?</div>
                    <button className='button-default text-[20px]' onClick={() => navigate('/login')}>Log in</button>
                </div>
                
            </div>
            
        </div>
    );
}

export default StartPage;