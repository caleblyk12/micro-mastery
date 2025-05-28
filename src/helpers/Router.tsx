import { createBrowserRouter } from "react-router-dom";

import ErrorPage from "../pages/ErrorPage"
import StartPage from "../pages/StartPage";
import RegistrationPage from "../pages/RegistrationPage";
import LoginPage from "../pages/LoginPage";
import RegisteredPage from "../pages/RegisteredPage";

import LayoutParent from "../pages/LayoutParent";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import CategoriesPage from "../pages/CategoriesPage";

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
        element: <LayoutParent/>,
        children: [
            {
                path: 'home',
                element: <HomePage/>
            },
            {
                path: 'profile',
                element: <ProfilePage/>
            },
            {
                path: 'categories',
                element: <CategoriesPage/>
            }
        ]
    }
])

export default router;