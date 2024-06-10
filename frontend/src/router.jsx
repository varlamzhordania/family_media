import {createBrowserRouter} from "react-router-dom";
import Login from "./pages/Login.jsx";
import ErrorPage from "./pages/Error.jsx";
import RootLayout from "./layout/RootLayout.jsx";
import RootPage from "./pages/Root.jsx";

export const router = createBrowserRouter([
    {
        path: "",
        element: <RootLayout/>,
        errorElement: <RootLayout><ErrorPage/></RootLayout>,
        children: [
            {
                path: "/",
                element: <RootPage/>,
            },
            {
                path: "/auth/login/",
                element: <Login/>,
            },
        ]
    },
]);