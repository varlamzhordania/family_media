import {useRef} from "react";
import {Avatar, Box, Typography} from "@mui/material";
import {getFormattedDate} from "@lib/utils/times.js";
import {completeServerUrl, isSender} from "@lib/utils/socket.js";
import {AudioFile, Check, DoneAll, InsertDriveFile, Videocam} from "@mui/icons-material";
import {CHAT_ATTACHMENT_STYLE, HorizontalStyle, VerticalStyle} from "@lib/theme/styles.js";
import {formatFileSize, getDirectionMessage} from "@lib/utils/index.jsx";
import {getOpponent} from "@lib/utils/chat.jsx";
import FileIcons from "@components/ChatPanel/FileIcons.jsx";

const Chat = ({data, contextMenu, selected, setContextMenu, setSelectMessage, user, setReplyTo}) => {
    const messageRef = useRef(null);
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
            {data.medias.map((media, index) => <ChatMedia key={index} isOwn={isOwn} data={media}/>)}
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
                    {!isOwn && selected?.type !== "private" && data?.user?.full_name}
                </Typography>
            </Box>

            <Box sx={{...HorizontalStyle, width: "100%", alignItems: "end"}}>
                {
                    !isOwn && selected?.type !== "private" &&
                    <Avatar sx={{width: "45px", height: "45px", mb: 2}} src={completeServerUrl(data?.user?.avatar)}
                            alt={data?.user?.full_name}>
                        {data?.user?.initial_name}
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
                                     bgcolor: isOwn ? `rgba(0, 0, 0, 0.05)` : `rgba(0, 0, 0, 0.08)`,
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
                            {data.content ? data.content : isOwn ? `You uploaded ${data.medias.length} file. ` : `${data.user.full_name} uploaded ${data.medias.length} file.`}
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

const ChatMedia = ({data, isOwn}) => {
    const url = completeServerUrl(data.file)
    const getPreviewComponent = () => {
        const image = ['jpg', 'jpeg', 'pjpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'svg', 'heif', 'heic'];
        const video = ['mp4', 'webm', 'avi', 'mkv', 'mpeg', 'mpg', 'mov', 'wmv', 'flv', '3gp', 'm4v'];
        const audio = ['mp3', 'wav', 'ogg', 'flac'];
        const document = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'];

        const ext = data.ext.toLowerCase().split(".")[1];


        if (image.includes(ext)) {
            return <img src={url} alt={extractName()}
                        style={{width: "100%", height: "100%", objectFit: "cover"}}/>;
        } else if (video.includes(ext)) {
            return <Box sx={CHAT_ATTACHMENT_STYLE}>
                <Videocam/>
            </Box>;
        } else if (audio.includes(ext)) {
            return <Box sx={CHAT_ATTACHMENT_STYLE}>
                <AudioFile/>
            </Box>;
        } else {
            return <Box sx={CHAT_ATTACHMENT_STYLE}>
                <InsertDriveFile/>
            </Box>;
        }
    }

    const extractName = () => {
        const parts = data.file.split("/");
        return parts[parts.length - 1];
    }

    return (
        <Box sx={{
            ...HorizontalStyle,
            bgcolor: theme => isOwn ? `${theme.palette.primary.light}50` : "grey.main",
            width: "100%",
            gap: 0.5,
            padding: 0.5,
            borderRadius: "8px",
            mb: 0.3,
            textDecoration: "none",
            "&:hover": {
                bgcolor: theme => isOwn ? `${theme.palette.primary.main}50` : "grey.dark",
            }
        }} component={"a"} href={url} download color={"black"}>
            <Box sx={{
                width: "64px",
                height: "64px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
            }}>
                {getPreviewComponent()}
            </Box>
            <Box sx={{...VerticalStyle, gap: 0, paddingLeft: "8px", flexGrow: 1}}>
                <Typography variant={"subtitle2"}>
                    {extractName()}
                </Typography>
                <Typography variant={"caption"}>{formatFileSize(data.size)}</Typography>
            </Box>
        </Box>
    );
}

export default Chat