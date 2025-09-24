import { createBrowserRouter } from "react-router-dom";

import ErrorPage from "../pages/ErrorPage";
import StartPage from "../pages/StartPage";
import RegistrationPage from "../pages/RegistrationPage";
import LoginPage from "../pages/LoginPage";
import RegisteredPage from "../pages/RegisteredPage";

import LayoutParent from "../pages/LayoutParent";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import CategoriesPage from "../pages/CategoriesPage";
import CategoryPage from "../pages/CategoryPage";
import SkillPage from "../pages/SkillPage";
import MysteryPage from "../pages/MysteryPage";
import MyFriendsPage from "../pages/MyFriendsPage";
import SearchFriendsPage from "../pages/SearchFriendsPage";
import FriendRequestsPage from "../pages/FriendRequestsPage";
import FriendProfilePage from "../pages/FriendProfilePage";
import SettingsPage from "../pages/SettingsPage";

import Wrapper from "./Wrapper";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegistrationPage />,
  },
  {
    path: "/registered",
    element: <RegisteredPage />,
  },
  {
    path: "/nav",
    element: (
      <Wrapper>
        <LayoutParent/>
      </Wrapper>
    ),
    children: [
      {
        path: "home",
        element: <HomePage/>,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "category/:id",
        element: <CategoryPage />,
      },
      {
        path: "skill/:id",
        element: <SkillPage />,
      },
      {
        path: "mystery",
        element: <MysteryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage/>
      },
      {
        path: "friends",
        children: [
          {
            path: "",
            element: <MyFriendsPage />,
          },
          {
            path: "search",
            element: <SearchFriendsPage />,
          },
          {
            path: "requests",
            element: <FriendRequestsPage />,
          },
          {
            path: ":id",
            element: <FriendProfilePage />,
          },
        ],
      },
    ],
  },
]);

export default router;