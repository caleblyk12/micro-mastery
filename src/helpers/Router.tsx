import { createBrowserRouter } from "react-router-dom";

import ErrorPage from "../pages/ErrorPage"
import StartPage from "../pages/StartPage";
import RegistrationPage from "../pages/RegistrationPage";
import LoginPage from "../pages/LoginPage";
import RegisteredPage from "../pages/RegisteredPage";

import NavParentPage from "../pages/NavParentPage";
import HomePage from "../pages/HomePage";

const router = createBrowserRouter([
    {
        path: '/', 
        element: <StartPage/>,
        errorElement: <ErrorPage />
    },
    {
        path: '/login', 
        element: <LoginPage/>
    },
    {
        path: '/register', 
        element: <RegistrationPage/>
    },
    {
        path: '/registered', 
        element: <RegisteredPage/>
    },
    {
        path: '/nav',
        element: <NavParentPage/>,
        children: [
            {
                path: 'home',
                element: <HomePage/>
            }
        ]
    }
])

export default router;