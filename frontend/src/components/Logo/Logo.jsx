import {Box, Typography} from "@mui/material";

const Logo = ({flexGrow = 1, variant = "h4", text = "Family Arbore"}) => {
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "start",
            alignItems: "flex-end",
            gap: 2,
            flexGrow: flexGrow,
        }}>
            <img src={"/logo2edited.jpg"} alt={"logo"} className={"logo"}/>
            <Typography variant={variant} component={"h1"} fontWeight={600} color={"primary"} noWrap>
                {text}
            </Typography>
        </Box>
    )
}

export default Logo