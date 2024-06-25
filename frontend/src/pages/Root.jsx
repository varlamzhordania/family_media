import {Navigate} from "react-router-dom";
import Home from "./Home.jsx";
import DefaultLayout from "@layout/DefaultLayout.jsx";
import {useAccessToken} from "@lib/hooks/useToken.jsx";

const RootPage = () => {
    const [accessToken, _] = useAccessToken()

    if (accessToken) {
        return (
            <DefaultLayout><Home/></DefaultLayout>
        )
    }

    return <Navigate to={'/auth/login'} replace={true}/>
}

export default RootPage