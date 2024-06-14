import {Navigate} from "react-router-dom";
import {getToken} from "@lib/utils/token.js";
import Home from "./Home.jsx";
import DefaultLayout from "@layout/DefaultLayout.jsx";

const RootPage = () => {
    const token = getToken()

    if (token) {
        return (
            <DefaultLayout><Home/></DefaultLayout>
        )
    }

    return <Navigate to={'/auth/login'} replace={true}/>
}

export default RootPage