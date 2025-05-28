import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function NavBar() {

    const navigate = useNavigate();

    return(
        <>
        <div>
            <Link to='/nav/home'>Home</Link>
            <Link to='/nav/profile'>Profile</Link>
            <Link to='/nav/categories'>Categories</Link>
        </div>
        <button onClick={() => navigate('/')}>Logout</button>
        </>
        
    );
}

export default NavBar;