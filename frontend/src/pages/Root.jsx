import {Navigate, Outlet} from "react-router-dom";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import DefaultLayout from "@layout/DefaultLayout.jsx";
import ContextLayout from "@layout/ContextLayout.jsx";
import RootLayout from "@layout/RootLayout.jsx";

const RootPage = ({defaultLayout = true}) => {
    const [accessToken] = useAccessToken()

    if (accessToken) {
        return (
            <RootLayout>
                <ContextLayout>
                    {
                        defaultLayout ? (
                            <DefaultLayout>
                                <Outlet/>
                            </DefaultLayout>
                        ) : <Outlet/>
                    }
                </ContextLayout>
            </RootLayout>
        )
    }

    return <Navigate to={'/auth/login'} replace={true}/>
}

export default RootPage