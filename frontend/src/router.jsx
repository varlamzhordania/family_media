import {createBrowserRouter} from "react-router-dom";
import RootLayout from "@layout/RootLayout.jsx";
import Login from "@pages/Login.jsx";
import ErrorPage from "@pages/Error.jsx";
import RootPage from "@pages/Root.jsx";
import Home from "@pages/Home.jsx";
import Account from "@pages/Account.jsx";
import Family from "@pages/Family.jsx";
import FamilyDashboard from "@pages/FamilyDashboard.jsx";
import Register from "@pages/Register.jsx";
import Invitation from "@pages/Invitation.jsx";
import ForgetPassword from "@pages/ForgetPassword.jsx";
import ResetPassword from "@pages/ResetPassword.jsx";

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
                        path: "/family/:id/",
                        element: <FamilyDashboard/>
                    },
                    {
                        path: "/invitations/:code/",
                        element: <Invitation/>
                    }
                ]
            },
            {
                path: "/auth/login/",
                element: <RootLayout><Login/></RootLayout>,
            },
            {
                path: "/auth/register/",
                element: <RootLayout><Register/></RootLayout>,
            },
            {
                path: "/auth/forget-password/",
                element: <RootLayout><ForgetPassword/></RootLayout>,
            },
            {
                path: "/auth/reset-password/:uid/:token/",
                element: <RootLayout><ResetPassword/></RootLayout>,
            },
        ]
    },
]);