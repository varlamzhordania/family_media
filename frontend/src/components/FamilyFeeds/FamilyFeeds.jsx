import {Box} from "@mui/material";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {listService} from "@lib/services/postService.js";
import {useState} from "react";
import FabAddPost from "@components/FabAddPost/FabAddPost.jsx";
import CommentDrawer from "@components/CommentDrawer/CommentDrawer.jsx";
import {EmptyPosts, PostCard, PostSkeleton} from "@components/PostCard/PostCard.jsx";

const FamilyFeeds = () => {
    const {id} = useParams()
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
        queryKey: ["posts", "family", id],
        queryFn: () => listService(id)
    })

    return (
        <Box>
            <Box sx={{display: "flex", flexDirection: "column", gap: 3, pb: 4}}>
                {
                    postQuery?.isLoading ? <PostSkeleton/>
                        : postQuery?.data?.count === 0 ? (<EmptyPosts handleDrawer={handlePostDrawer}/>)
                            : postQuery?.data?.results?.map(item => (
                                <PostCard key={item.id} data={item} handleCommentDrawer={handleCommentDrawer}
                                          handleComment={onCommentClick}/>))
                }
            </Box>

            <FabAddPost showDrawer={showPostDrawer} handleDrawer={handlePostDrawer}/>
            <CommentDrawer showDrawer={showCommentDrawer} handleDrawer={handleCommentDrawer}
                           selectedPost={selectedComment}/>
        </Box>
    )
}

export default FamilyFeeds