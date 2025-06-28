import { NavLink, useNavigate } from 'react-router-dom';
import orbitalDog from '../assets/orbitalDog256.png';
import { supabase } from '../helpers/supabaseClient';

function NavBar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut(); 
        navigate('/'); 
    };

    return (
        <>
            {/* Top-left icon */}
            <div className="fixed top-8 left-6 z-50 flex items-center gap-2">
                <img src={orbitalDog} className="w-8 h-8" />
                <span className="text-lg font-bold">Micro-Mastery</span>
            </div>

            {/* Logout button */}
            <button
                onClick={handleLogout}
                className="fixed top-6 right-6 z-50 button-default"
            >
                Logout
            </button>

            {/* Centered capsule navbar */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.15),_0_-4px_12px_0_rgba(0,0,0,0.1)] rounded-full w-[50%] px-6 py-3 z-40 flex justify-evenly items-center">
                <NavLink
                    to="/nav/home"
                    className={({ isActive }) =>
                        isActive ? 'text-blue-700 font-semibold' : 'text-gray-800'
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/nav/profile"
                    className={({ isActive }) =>
                        isActive ? 'text-blue-700 font-semibold' : 'text-gray-800'
                    }
                >
                    Profile
                </NavLink>
                <NavLink
                    to="/nav/categories"
                    className={({ isActive }) =>
                        isActive ? 'text-blue-700 font-semibold' : 'text-gray-800'
                    }
                >
                    Categories
                </NavLink>
                <NavLink
                    to="/nav/mystery"
                    className={({ isActive }) =>
                        isActive ? 'text-blue-700 font-semibold' : 'text-gray-800'
                    }
                >
                    Mystery
                </NavLink>
                <NavLink
                    to="/nav/friends"
                    className={({ isActive }) =>
                        isActive ? "text-blue-700 font-semibold" : "text-gray-800"
                    }
                >
                    Friends
                </NavLink>
                <NavLink
                    to="/nav/settings"
                    className={({ isActive }) =>
                        isActive ? "text-blue-700 font-semibold" : "text-gray-800"
                    }
                >
                    Settings
                </NavLink>
            </div>

            {/* Spacer to avoid overlap */}
            <div className="h-25" />
        </>
    );
}

export default NavBar;

