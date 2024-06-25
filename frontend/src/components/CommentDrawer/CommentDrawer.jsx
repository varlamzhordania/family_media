import {
    Avatar, Box,
    Card,
    CardContent, CardHeader,
    Drawer, IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader, Skeleton, TextField,
    Typography
} from "@mui/material";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {createService, listService} from "@lib/services/commentService.js";
import {getNormalDate} from "@lib/utils/times.js";
import {useRef} from "react";
import {Send} from "@mui/icons-material";

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

const Form = ({id}) => {
    const inputRef = useRef()
    const queryClient = useQueryClient()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const text = inputRef.current.value
        if (text === null || text.strip === "")
            alert("Please Make Sure you have entered your comment correctly")

        try {
            const prepData = {
                post_id: id,
                text: text,
            }
            await createService(JSON.stringify(prepData))
            inputRef.current.value = ""
            queryClient.refetchQueries({queryKey: ["comments", id]})

        } catch (error) {
            console.log(error)
        }
    }


    return (
        <ListItem>
            <Card elevation={2} sx={{width: "100%"}}>
                <CardContent sx={{paddingBottom: "16px !important"}}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: 1,
                            justifyContent: "space-between",
                            alignItems: "start",
                        }}>
                            <TextField inputRef={inputRef}
                                       variant={"outlined"}
                                       fullWidth
                                       multiline
                                       label={"Your comment"}
                                       inputMode={"text"}
                                       type={"text"}
                                       placeholder={"enter your text here"}
                                       required
                            />
                            <IconButton size={"medium"} type={"submit"} role={"button"}>
                                <Send/>
                            </IconButton>
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
            <Card elevation={2} sx={{width: "100%"}}>
                <CardHeader
                    avatar={<Avatar>{data?.author?.member?.initial_name?.toUpperCase()}</Avatar>}
                    title={data?.author?.member?.full_name}
                    subheader={getNormalDate(data?.created_at)}
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
                <Card elevation={2} sx={{width: "100%"}}>
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