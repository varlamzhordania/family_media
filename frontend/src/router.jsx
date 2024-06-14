import {createBrowserRouter} from "react-router-dom";
import RootLayout from "@layout/RootLayout.jsx";
import Login from "@pages/Login.jsx";
import ErrorPage from "@pages/Error.jsx";
import RootPage from "@pages/Root.jsx";

export const router = createBrowserRouter([
    {
        path: "",
        element: null,
        errorElement: <RootLayout><ErrorPage/></RootLayout>,
        children: [
            {
                path: "/",
                element: <RootPage/>,
            },
            {
                path: "/auth/login/",
                element: <RootLayout><Login/></RootLayout>,
            },
        ]
    },
]);