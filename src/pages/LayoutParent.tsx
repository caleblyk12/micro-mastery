import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";



function LayoutParent() {
    return(
        <div>
            <NavBar/>
            <Outlet />
        </div>
    );
}

export default LayoutParent;