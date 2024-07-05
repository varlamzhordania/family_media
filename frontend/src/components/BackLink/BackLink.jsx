import {Button} from "@mui/material";
import {Link} from "react-router-dom";
import {ArrowBackIos} from "@mui/icons-material";

const BackLink = ({href}) => {
    return (
        <Button component={Link} to={href} variant={"soft"} color={"dark"} size={"small"} sx={{mb: 2}}
                startIcon={<ArrowBackIos/>}>back</Button>
    )
}

export default BackLink