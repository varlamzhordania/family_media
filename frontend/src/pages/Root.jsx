import {Navigate, Outlet} from "react-router-dom";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import DefaultLayout from "@layout/DefaultLayout.jsx";

const RootPage = () => {
    const [accessToken, _] = useAccessToken()

    if (accessToken) {
        return (
            <DefaultLayout><Outlet/></DefaultLayout>
        )
    }

    return <Navigate to={'/auth/login'} replace={true}/>
}

export default RootPage