import {useRef, useState} from "react";
import {Avatar, Box, Typography} from "@mui/material";
import {getFormattedDate} from "@lib/utils/times.js";
import {completeServerUrl, isSender} from "@lib/utils/socket.js";
import {Check, DoneAll} from "@mui/icons-material";
import {HorizontalStyle, VerticalStyle} from "@lib/theme/styles.js";
import {getDirectionMessage} from "@lib/utils/index.jsx";
import {useSwipeable} from "react-swipeable";

const Chat = ({data, contextMenu, selected, setContextMenu, setSelectMessage, user, setReplyTo}) => {
    // const [swipeDirection, setSwipeDirection] = useState('');
    // const [isSwiping, setIsSwiping] = useState(false);
    const messageRef = useRef(null);
    //
    // const handleSwiping = (props) => {
    //     if (props.deltaX < -30) {
    //         setIsSwiping(true);
    //         setSwipeDirection('left');
    //     }
    // };
    //
    // const handleSwipeLeft = (props) => {
    //     setSwipeDirection('left');
    //     setIsSwiping(false);
    //     if (props.deltaX < -200) {
    //         setSelectMessage(data);
    //         setReplyTo(data)
    //     }
    //
    // };
    //
    // const handleSwipeEnd = () => {
    //     setIsSwiping(false);
    //     setSwipeDirection('');
    // };
    //
    // const handlers = useSwipeable({
    //     onSwiping: handleSwiping,
    //     onSwipedLeft: handleSwipeLeft,
    //     onSwiped: handleSwipeEnd,
    //     preventDefaultTouchmoveEvent: true,
    //     trackMouse: true
    // className={`chat-message ${isSwiping ? 'swiping' : ''} ${swipeDirection}`}
    // });

    const handleContextMenu = (event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                } : null,
        );
        setSelectMessage(data)
    };

    const isOwn = isSender(data, user)


    return (
        <Box id={`chat_${data.id}`} sx={{
            ...VerticalStyle,
            position: "relative",
            maxWidth: {xs: "100%", md: "75%"},
            width: "auto",
            minWidth: "55%",
            my: 2,
            float: isOwn ? "right" : "left",
            gap: 0,
        }} onContextMenu={handleContextMenu}>
            <Box sx={{
                ...HorizontalStyle,
                width: "100%",
                flexDirection: isOwn ? "row-reverse" : "row",
            }}>

                <Typography variant={"caption"} sx={{
                    width: "100%",
                    p: isOwn ? "0 1rem 0 0" : "0 0 0 4rem",
                    textAlign: isOwn ? "end" : "start",
                }}
                >
                    {!isOwn && selected?.type !== "private" && data.user.full_name}
                </Typography>
            </Box>

            <Box sx={{...HorizontalStyle, width: "100%", alignItems: "end"}}>
                {
                    !isOwn && selected?.type !== "private" &&
                    <Avatar sx={{width: "45px", height: "45px", mb: 2}} src={completeServerUrl(data.user.avatar)}
                            alt={data.user.full_name}>
                        {data.user.initial_name}
                    </Avatar>
                }
                <Box sx={{...VerticalStyle, width: "100%", gap: 0.5}}>
                    <Box sx={{
                        position: "relative",
                        bgcolor: theme => isOwn ? `${theme.palette.primary.light}50` : "grey.main",
                        py: 1,
                        px: 2,
                        zIndex: 1,
                        borderRadius: isOwn ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0rem",
                        width: "100%",
                    }}>
                        {
                            data?.reply_to &&
                            <Box component={"a"} href={`#chat_${data?.reply_to?.id}`}
                                 sx={{
                                     ...VerticalStyle,
                                     gap: 0,
                                     width: "100%",
                                     bgcolor: isOwn ? `rgba(0,0,0,0.05)` : `rgba(0,0,0,0.08)`,
                                     borderRadius: theme => theme.shape.borderRadius / 8,
                                     borderLeft: theme => `4px solid ${isOwn ? theme.palette.primary.main : theme.palette.primary.main}`,
                                     py: 1,
                                     px: 2,
                                     my: 1,
                                     cursor: "pointer",
                                     direction: getDirectionMessage(data.reply_to.content),
                                     textDecoration: "none",
                                 }}
                            >
                                <Typography variant={"subtitle2"} color={"primary.dark"}>
                                    {data?.reply_to?.user?.full_name}
                                </Typography>
                                <Typography variant={"caption"} sx={{wordBreak: "break-all"}} color={"black"}>
                                    {data?.reply_to?.content?.length > 50 ? data?.reply_to?.content?.substr(0, 50) + "..." : data?.reply_to?.content}
                                </Typography>
                            </Box>
                        }
                        <Typography ref={messageRef} variant={"body1"}
                                    sx={{
                                        width: "100%",
                                        wordBreak: "break-word",
                                        direction: getDirectionMessage(data.content),
                                    }}

                        >
                            {data.content}
                        </Typography>
                    </Box>
                    <Box sx={{
                        ...HorizontalStyle,
                        width: "100%",
                        flexDirection: isOwn ? "row-reverse" : "row",
                        p: isOwn ? "0 0 0 1.5rem" : "0 1.5rem 0 0",
                    }}>
                        <Typography variant={"caption"} component={"p"}>
                            {getFormattedDate(data.created_at, {
                                showTime: true,
                                dateOptions: {year: "numeric", month: "short", day: "2-digit"},
                                timeOptions: {hour: "numeric", minute: "numeric"},
                            })}
                        </Typography>
                        {
                            data.have_read.length > 1 ? <DoneAll fontSize={"8px"} color={"primary"}/> :
                                <Check fontSize={"8px"} color={"action"}/>
                        }
                    </Box>
                </Box>
            </Box>
        </Box>


    )
}

export default Chat