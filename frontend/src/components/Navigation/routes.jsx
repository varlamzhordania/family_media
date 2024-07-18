import {AccountCircle, Diversity2, Forum, Home} from "@mui/icons-material";

export const routes = [
    {
        title: "Home",
        icon: <Home/>,
        href: "/",
    },
    {
        title: "Family",
        icon: <Diversity2/>,
        href: "/family/",
    },
    {
        title: "Messages",
        icon: <Forum/>,
        href: "/message/",
    },
    {
        title: "Account",
        icon: <AccountCircle/>,
        href: "/account/",
    },
]