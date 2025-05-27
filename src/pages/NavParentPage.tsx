import { Outlet } from "react-router-dom";


function NavParentPage() {
    return(
        <div>
            <p>NavBar</p>
            <Outlet />
        </div>
    );
}

export default NavParentPage;