import {
    Avatar, Box,
    Card,
    CardContent, CardHeader,
    Drawer, IconButton, InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListSubheader, Skeleton, TextField,
    Typography
} from "@mui/material";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {createService, listService} from "@lib/services/commentService.js";
import {getFormattedDate} from "@lib/utils/times.js";
import {useEffect, useRef, useState} from "react";
import {EmojiEmotions, Send,} from "@mui/icons-material";
import toast from "react-hot-toast";
import {handleError} from "@lib/utils/service.js";
import EmojiPicker from "emoji-picker-react";
import {HorizontalStyle} from "@lib/theme/styles.js";
import {useUserContext} from "@lib/context/UserContext.jsx";

const CommentDrawer = ({handleDrawer, showDrawer, selectedPost}) => {


    const commentsQuery = useQuery({
        queryKey: ['comments', selectedPost],
        queryFn: () => listService(selectedPost)
    })


    return (
        <Drawer
            open={showDrawer}
            anchor="right"
            onClose={handleDrawer}
            PaperProps={{
                sx: {width: {xs: "100%", sm: "75%", md: "60%", lg: "50%", xl: "40%"}}
            }}
            transitionDuration={400}
        >
            <List sx={{
                height: "100%",
            }}>
                <ListSubheader>
                    <ListItemText primary={"COMMENTS"}
                                  primaryTypographyProps={{
                                      variant: "h4",
                                      fontWeight: "bold",
                                      textAlign: "center"
                                  }}/>
                </ListSubheader>
                <Form id={selectedPost}/>
                {commentsQuery.isLoading && <CommentSkeleton/>}
                {commentsQuery.data?.results?.map((item) => <CommentItem key={item.id} data={item}/>)}
            </List>
        </Drawer>
    )
}

const Form = ({id,}) => {
    const [showEmoji, setShowEmoji] = useState(false)
    const {user} = useUserContext()
    const [data, setData] = useState({
        text: ""
    })
    const emojiPickerRef = useRef(null);
    const queryClient = useQueryClient()


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
    }

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
                post_id: id,
                text: data.text,
            }
            await createService(JSON.stringify(prepData))
            setData({text: ""})
            toast.success("Have submitted a new comment.")
            queryClient.refetchQueries({queryKey: ["comments", id]})

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


    return (
        <ListItem>
            <Card variant={"outlined"} sx={{width: "100%", overflow: "visible"}}>
                <CardContent sx={{paddingBottom: "16px !important"}}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{
                            ...HorizontalStyle,
                            position: "relative",
                            flexWrap: "nowrap",
                            gap: 1,
                            alignItems: "start",

                        }}>
                            <Avatar src={user?.avatar} alt={user?.initial_name}/>
                            <TextField
                                type={"text"}
                                name={"text"}
                                value={data.text}
                                onChange={handleChange}
                                placeholder={"Write a comment..."}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleShowEmoji}>
                                                <EmojiEmotions/>
                                            </IconButton>
                                        </InputAdornment>
                                }}
                                maxRows={2}
                                multiline
                                fullWidth
                                required
                            />
                            <IconButton size={"medium"} type={"submit"}>
                                <Send/>
                            </IconButton>
                            <Box sx={{
                                position: "absolute",
                                top: "120%",
                                right: 50,
                                zIndex:1000
                            }}
                                 ref={emojiPickerRef}
                            >
                                <EmojiPicker open={showEmoji} onEmojiClick={onEmojiClick}/>
                            </Box>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </ListItem>
    )
}


const CommentItem = ({data}) => {


    return (
        <ListItem key={data.id}>
            <Card variant={"outlined"} sx={{width: "100%"}}>
                <CardHeader
                    avatar={<Avatar>{data?.author?.member?.initial_name?.toUpperCase()}</Avatar>}
                    title={data?.author?.member?.full_name}
                    subheader={getFormattedDate(data?.created_at, {showDate: true, showTime: true})}
                />
                <CardContent>
                    <Typography variant="body1" mt={1} fontWeight={500} color="text.secondary">
                        {data?.text}
                    </Typography>
                    <List>
                        {data?.children.map(child => <CommentItem key={child.id} data={child}/>)}
                    </List>
                </CardContent>
            </Card>
        </ListItem>
    )
}

const CommentSkeleton = () => {
    return Array.from(Array(10)).map((item, index) => (
            <ListItem key={index}>
                <Card sx={{width: "100%"}}>
                    <CardHeader
                        avatar={<Skeleton variant={"circular"} width={45} height={45}/>}
                        title={<Skeleton variant={"text"} width={300}/>}/>
                    <CardContent>
                        <Skeleton variant={"rounded"} height={100} width={"100%"}/>
                    </CardContent>
                </Card>
            </ListItem>

        )
    )
}


export default CommentDrawer