export const ModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {xs: "75%", sm: "65%", md: "50%", lg: "40%", xl: "30%"},
    height: "auto",
}

export const CHAT_UPLOAD_MODAL = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    bgcolor: "rgba(233,237,239,1)",
    zIndex: "1001",
    p: 4,
    gap: 5
}
export const CHAT_ATTACHMENT_STYLE = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    bgcolor: "rgba(0,0,0,0.3)",
    width: "100%",
    height: "100%",
    color: "white",
}
export const MenuStyle = {
    width: 165,
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    '& .MuiAvatar-root': {
        width: 32,
        height: 32,
        ml: -0.5,
        mr: 1,
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 18,
        width: 10,
        height: 10,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
    },
}
export const MenuStyleReverseLeft = {
    width: 165,
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    '& .MuiAvatar-root': {
        width: 32,
        height: 32,
        ml: -0.5,
        mr: 1,
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        bottom: -10,
        left: 12,
        width: 10,
        height: 10,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
    },
}

export const VerticalStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "start",
    gap: 2,
}
export const HorizontalStyle = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 1
}

export const DANGER_STYLE = {
    transition: "1s easy",
    "&:hover,&:hover .MuiSvgIcon-root ": {backgroundColor: theme => `${theme.palette.error.dark}`, color: "white"},
}


