import {
    Box,
    Grid,
} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {listService} from "@lib/services/postService.js";
import RecentMessages from "@components/RecentMessages/RecentMessages.jsx";
import FabAddPost from "@components/FabAddPost/FabAddPost.jsx";
import {useState} from "react";
import CommentDrawer from "@components/CommentDrawer/CommentDrawer.jsx";
import {EmptyPosts, PostCard, PostSkeleton} from "@components/PostCard/PostCard.jsx";
import FriendsList from "@components/FriendsList/FriendsList.jsx";

const Home = () => {
    const [showPostDrawer, setShowPostDrawer] = useState(false)
    const [showCommentDrawer, setShowCommentDrawer] = useState(false)
    const [selectedComment, setSelectedComment] = useState(null)
    const handlePostDrawer = () => {
        setShowPostDrawer(prevState => !prevState)
    }
    const handleCommentDrawer = () => {
        setShowCommentDrawer(prevState => !prevState)
    }
    const onCommentClick = (id) => {
        setSelectedComment(id)
    }


    const postQuery = useQuery({
        queryKey: ["posts"],
        queryFn: () => listService()
    })

    return (
        <>
            <Grid item xs={12} sm={8} md={6} lg={6} xl={7} order={{xs: 2, md: 1}}>
                <Box sx={{display: "flex", flexDirection: "column", gap: 3, pb: 4}}>
                    {
                        postQuery?.isLoading ? <PostSkeleton/>
                            : postQuery?.data?.count === 0 ? (<EmptyPosts handleDrawer={handlePostDrawer}/>)
                                : postQuery?.data?.results?.map(item => (
                                    <PostCard key={item.id} data={item} handleCommentDrawer={handleCommentDrawer}
                                              handleComment={onCommentClick}/>))
                    }
                </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={3} lg={3} xl={3} order={{xs: 1, md: 2}}>
                <FriendsList/>
            </Grid>
            <FabAddPost showDrawer={showPostDrawer} handleDrawer={handlePostDrawer}/>
            <CommentDrawer showDrawer={showCommentDrawer} handleDrawer={handleCommentDrawer}
                           selectedPost={selectedComment}/>
        </>
    )
}

export default Home