import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY} from "@lib/hooks/useToken.jsx";
import {MEMBERSHIPS_KEY, USER_KEY} from "@lib/hooks/useUser.jsx";
import toast from "react-hot-toast";

export const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(MEMBERSHIPS_KEY)
    toast.success("Successfully logged out.")
}