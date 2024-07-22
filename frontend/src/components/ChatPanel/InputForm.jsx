import {useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";
import {handleError} from "@lib/utils/service.js";
import {getDirectionMessage, getRandomNumber} from "@lib/utils/index.jsx";
import {Box, IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, TextField, Typography} from "@mui/material";
import {CHAT_UPLOAD_MODAL, HorizontalStyle, MenuStyleReverseLeft, VerticalStyle} from "@lib/theme/styles.js";
import {
    Add,
    Close,
    EmojiEmotions,
    InsertDriveFile, ModeEdit,
    PermMedia,
    Reply,
    Send,
} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import {useUserContext} from "@lib/context/UserContext.jsx";
import VisuallyHiddenInput from "@components/VisuallyHiddenInput/VisuallyHiddenInput.jsx";
import FilePreview from "@components/ChatPanel/FilePreview.jsx";
import UploadProgress from "@components/ChatPanel/UploadProgress.jsx";

const InputForm = ({selected, sendJsonMessage, replyTo, setReplyTo, editing, setEditing}) => {
    const {user} = useUserContext()
    const [anchorEl, setAnchorEl] = useState(null);
    const [uploadingTasks, setUploadingTasks] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false)
    const [data, setData] = useState({
        text: editing ? editing.content : ""
    })
    const [direction, setDirection] = useState("rtl")
    const [selectedFiles, setSelectedFiles] = useState({media: [], documents: []});
    const emojiPickerRef = useRef(null);

    const handleFileChange = (event, type) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles) => ({
            ...prevFiles,
            [type]: [...prevFiles[type], ...files],
        }));
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


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
                action: editing ? "edit_message" : "new_message",
                message: data.text,
                reply_to: replyTo ? replyTo.id : null,
                editing: editing.id,
            }
            sendJsonMessage(prepData)
            setData({text: ""})
            setReplyTo(null)
            setEditing(null)
            sendJsonMessage({action: "stop_typing", user: user.full_name})

        } catch (error) {
            handleError(error)
        }
    }

    const handleSendXhr = (formData) => {
        try {
            if (!uploadingTasks) {
                setUploadingTasks({id: getRandomNumber(), data: formData, start: false, last_progress: 0})
            }
            // setUploadingTasks(prevState => {
            //     const existingTask = prevState.find(task => {
            //         // Compare existing tasks with new ones
            //         return JSON.stringify(task.data) === JSON.stringify(formData);
            //     });
            //     console.log("exists", existingTask)
            //     if (!existingTask) {
            //         return [...prevState, {id: getRandomNumber(), data: formData, start: false, last_progress: 0}];
            //     }
            //     return prevState;
            // });


        } catch (error) {
            handleError(error);
        }
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            setData({text: ""})
            setSelectedFiles({media: [], documents: []})
        };
    }, []);

    useEffect(() => {
        setData({text: editing ? editing.content : ""})
        setSelectedFiles({media: [], documents: []})

        return () => {
            setData({text: ""})
            setSelectedFiles({media: [], documents: []})
            setEditing(null)
        }

    }, [selected]);

    useEffect(() => {
        setData({text: editing ? editing.content : ""})

    }, [editing]);

    useEffect(() => {
        const dir = getDirectionMessage(data.text)
        setDirection(dir)
    }, [data.text])


    return (
        <form onSubmit={handleSubmit}>
            {
                uploadingTasks &&
                <Box sx={{...CHAT_UPLOAD_MODAL, height: "fit-content"}}>
                    <UploadProgress task={uploadingTasks} setTasks={setUploadingTasks}/>
                </Box>
            }

            {
                (selectedFiles?.media?.length > 0 || selectedFiles?.documents?.length > 0) &&
                <FilePreview selected={selected} reply={replyTo} selectedFiles={selectedFiles}
                             setSelectedFiles={setSelectedFiles} handleSendXhr={handleSendXhr}/>
            }
            {
                editing && <Box sx={{
                    ...HorizontalStyle,
                    bgcolor: theme => `${theme.palette.info.light}30`,
                    borderRadius: theme => theme.shape.borderRadius,
                    py: 1,
                    px: 2,
                    mb: 1
                }}>
                    <ModeEdit/>
                    <Box sx={{...VerticalStyle, gap: 0, width: "100%"}}>
                        <Typography variant={"subtitle2"} color={"info.dark"}>
                            Edit Message
                        </Typography>
                        <Typography variant={"caption"} sx={{wordBreak: "break-all"}}>
                            {editing.content.length > 50 ? editing.content.substr(0, 50) + "..." : editing.content}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setEditing(null)}><Close/></IconButton>
                </Box>
            }

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
                            <IconButton onClick={handleMenu}>
                                <Add/>
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
            <AttachmentMenu anchorEl={anchorEl} handleClose={handleClose} selectedFiles={selectedFiles}
                            handleFileChange={handleFileChange}/>
        </form>
    )
}


const AttachmentMenu = ({anchorEl, handleClose, handleFileChange}) => {

    return (
        <Menu
            anchorEl={anchorEl}
            keepMounted
            PaperProps={{
                elevation: 0,
                sx: {...MenuStyleReverseLeft, width: 200}
            }}
            transformOrigin={{horizontal: 'left', vertical: 'bottom'}}
            anchorOrigin={{horizontal: 'left', vertical: 'top'}}
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem component={"label"}>
                <ListItemIcon>
                    <InsertDriveFile/>
                </ListItemIcon>
                Document
                <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.mp3,.wav,.ogg,.flac"
                    multiple
                    onChange={(e) => handleFileChange(e, 'documents')}
                />
            </MenuItem>
            <MenuItem component={"label"}>
                <ListItemIcon>
                    <PermMedia/>
                </ListItemIcon>
                Photos & videos
                <VisuallyHiddenInput
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'media')}
                />
            </MenuItem>
        </Menu>
    )
}

export default InputForm