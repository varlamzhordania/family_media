import {useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";
import {handleError} from "@lib/utils/service.js";
import {getDirectionMessage} from "@lib/utils/index.jsx";
import {Box, IconButton, InputAdornment, TextField, Typography} from "@mui/material";
import {HorizontalStyle, VerticalStyle} from "@lib/theme/styles.js";
import {Close, EmojiEmotions, Reply, Send} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import {useUserContext} from "@lib/context/UserContext.jsx";

const InputForm = ({sendJsonMessage, replyTo, setReplyTo}) => {
    const {user} = useUserContext()
    const [showEmoji, setShowEmoji] = useState(false)
    const [data, setData] = useState({
        text: ""
    })
    const [direction, setDirection] = useState("rtl")
    const emojiPickerRef = useRef(null);


    const handleShowEmoji = () => {
        setShowEmoji(prevState => !prevState)
    }


    const handleClickOutside = (e) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
            setShowEmoji(false);
        }
    };


    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))

        if (value.length > 3) {
            sendJsonMessage({action: "typing", user: user.full_name})
        } else {
            sendJsonMessage({action: "stop_typing", user: user.full_name})
        }
    }

    const handleKeyPress = (e) => {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setData(prevState => ({
            ...prevState,
            text: prevState.text + emojiObject.emoji
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (data.text === null || data.text.strip === "")
            toast.error("Please Make Sure you have entered your comment correctly")

        try {
            const prepData = {
                action: "new_message",
                message: data.text,
                reply_to: replyTo ? replyTo.id : null
            }
            sendJsonMessage(prepData)
            setData({text: ""})
            setReplyTo(null)
            sendJsonMessage({action: "stop_typing", user: user.full_name})

        } catch (error) {
            handleError(error)
        }
    }


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const dir = getDirectionMessage(data.text)
        setDirection(dir)
    }, [data.text])


    return (
        <form onSubmit={handleSubmit}>
            {
                replyTo && <Box sx={{
                    ...HorizontalStyle,
                    bgcolor: theme => `${theme.palette.info.light}30`,
                    borderRadius: theme => theme.shape.borderRadius,
                    py: 1,
                    px: 2,
                    mb: 1
                }}>
                    <Reply/>
                    <Box sx={{...VerticalStyle, gap: 0, width: "100%"}}>
                        <Typography variant={"subtitle2"} color={"info.dark"}>
                            Reply to {replyTo.user.full_name}
                        </Typography>
                        <Typography variant={"caption"} sx={{wordBreak: "break-all"}}>
                            {replyTo.content.length > 50 ? replyTo.content.substr(0, 50) + "..." : replyTo.content}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setReplyTo(null)}><Close/></IconButton>
                </Box>
            }
            <Box sx={{
                ...HorizontalStyle,
                position: "relative",
                flexWrap: "nowrap",
                gap: 1,
                py: 0.5,
                px: 0.1,
                alignItems: "start",
                backgroundColor: "rgba(0,0,0,0.04)",
                borderRadius: theme => theme.shape.borderRadius,
                ".MuiOutlinedInput-notchedOutline": {
                    border: "unset !important"
                },
            }}>
                <TextField
                    type={"text"}
                    name={"text"}
                    value={data.text}
                    onChange={handleChange}
                    placeholder={"Write your message..."}
                    onKeyDown={handleKeyPress}
                    InputProps={{
                        maxRows: 3,
                        sx: {
                            direction: direction
                        },
                        startAdornment: (<InputAdornment position={"start"}>
                            <IconButton onClick={handleShowEmoji}>
                                <EmojiEmotions/>
                            </IconButton>
                        </InputAdornment>),
                        endAdornment: (<InputAdornment position="end">
                            <IconButton color={"primary"} type={"submit"}>
                                <Send sx={{transform: direction === "ltr" ? "unset" : "rotateZ(180deg)"}}/>
                            </IconButton>
                        </InputAdornment>),
                    }}
                    autoFocus={true}
                    multiline
                    fullWidth
                    required
                />

                <Box sx={{
                    position: "absolute",
                    bottom: "120%",
                    left: 0,
                }}
                     ref={emojiPickerRef}
                >
                    <EmojiPicker style={{zIndex: "1000"}} reactionsDefaultOpen={true} open={showEmoji}
                                 onEmojiClick={onEmojiClick}/>
                </Box>
            </Box>
        </form>
    )
}

export default InputForm