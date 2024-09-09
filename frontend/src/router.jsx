import {createBrowserRouter} from "react-router-dom";
import {lazy} from "react";
import RootLayout from "@layout/RootLayout.jsx";
import AuthLayout from "@layout/AuthLayout.jsx";
import ErrorPage from "@pages/Error.jsx";
import Loader from "@components/Loader/Loader.jsx";

// Lazy load the components
const Login = lazy(() => import("@pages/Login.jsx"));
const Register = lazy(() => import("@pages/Register.jsx"));
const ForgetPassword = lazy(() => import("@pages/ForgetPassword.jsx"));
const ResetPassword = lazy(() => import("@pages/ResetPassword.jsx"));
const RootPage = lazy(() => import("@pages/Root.jsx"));
const Home = lazy(() => import("@pages/Home.jsx"));
const Account = lazy(() => import("@pages/Account.jsx"));
const Family = lazy(() => import("@pages/Family.jsx"));
const FamilyDashboard = lazy(() => import("@pages/FamilyDashboard.jsx"));
const Invitation = lazy(() => import("@pages/Invitation.jsx"));
const Message = lazy(() => import("@pages/Message.jsx"));

export const router = createBrowserRouter([
    {
        path: "",
        element: null,
        errorElement: <RootLayout><ErrorPage/></RootLayout>,
        children: [
            {
                path: "",
                element: <RootPage/>,
                children: [
                    {
                        path: "/",
                        element: <Home/>
                    },
                    {
                        path: "/account/",
                        element: <Account/>
                    },
                    {
                        path: "/family/",
                        element: <Family/>,
                    },
                    {
                        path: "/message/",
                        element: <Message/>
                    },
                    {
                        path: "/family/:id/",
                        element: <FamilyDashboard/>
                    },
                    {
                        path: "/invitations/:code/",
                        element: <Invitation/>
                    }
                ]
            },
            // {
            //     path: "/loader",
            //     element: <Loader/>,
            // },
            {
                path: "/auth/",
                element: null,
                children: [
                    {
                        path: "/auth/login/",
                        element: <AuthLayout><Login/></AuthLayout>,
                    },
                    {
                        path: "/auth/register/",
                        element: <AuthLayout><Register/></AuthLayout>,
                    },
                    {
                        path: "/auth/forget-password/",
                        element: <AuthLayout><ForgetPassword/></AuthLayout>,
                    },
                    {
                        path: "/auth/reset-password/:uid/:token/",
                        element: <AuthLayout><ResetPassword/></AuthLayout>,
                    },
                ]
            }
        ]
    },
]);