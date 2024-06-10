import {Navigate} from "react-router-dom";

const RootPage = () => {
    return <Navigate to={'/auth/login'} replace={true}/>
}

export default RootPage