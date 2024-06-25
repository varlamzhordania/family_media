import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia, Grid, IconButton,
    Skeleton,
    Typography
} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {likeService, listService} from "@lib/services/postService.js";
import {getNormalDate} from "@lib/utils/times.js";
import RecentMessages from "@components/RecentMessages/RecentMessages.jsx";
import FabAddPost from "@components/FabAddPost/FabAddPost.jsx";
import EmptyImage from "@public/empty.svg"
import {useEffect, useState} from "react";
import {Favorite, FavoriteBorder, ModeCommentOutlined} from "@mui/icons-material";
import CommentDrawer from "@components/CommentDrawer/CommentDrawer.jsx";
import {useMemberships} from "@lib/hooks/useUser.jsx";

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
                <RecentMessages/>
            </Grid>
            <FabAddPost showDrawer={showPostDrawer} handleDrawer={handlePostDrawer}/>
            <CommentDrawer showDrawer={showCommentDrawer} handleDrawer={handleCommentDrawer}
                           selectedPost={selectedComment}/>
        </>
    )
}

const PostCard = ({data, handleComment, handleCommentDrawer}) => {
    const [memberShips, _] = useMemberships()
    const [liked, setLiked] = useState(false)
    const [likeCounter, setLikeCounter] = useState(0)

    const getFeaturedMedia = (medias) => {
        // Filter for featured media
        const featuredMedia = medias.find(item => item?.is_featured === true);

        // Return featured media file if available
        if (featuredMedia && featuredMedia.file) {
            return featuredMedia.file;
        }

        // Define supported video file extensions
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'];

        // Find the first video file among media files
        const videoMedia = medias.find(item => {
            if (item?.file && videoExtensions.includes(item?.ext)) {
                return true;
            }
            return false;
        });

        // Return video media file if found
        if (videoMedia && videoMedia.file) {
            return videoMedia.file;
        }

        // If no video found, return the first available media file
        if (medias.length > 0 && medias[0].file) {
            return medias[0].file;
        }

        // Return null or handle edge cases as per your application's requirements
        return null;
    }
    const getExtension = (file) => {
        return file?.slice(-4)
    }

    const getComponent = () => {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'];
        const ext = getExtension(getFeaturedMedia(data?.medias))
        return videoExtensions.includes(ext) ? "video" : "img"
    }
    const getLikeStatus = () => {
        const likesUser = data?.likes?.users || [];
        const membershipIds = memberShips.map(member => member.id);
        return likesUser.some(userId => membershipIds.includes(userId));
    };
    const handleLike = async () => {
        if (liked) {
            // it means dislike
            const prepData = {
                post: data.id,
                action: "UNLIKE",
            }
            try {
                const {likes_count} = await likeService(JSON.stringify(prepData))
                setLiked(false)
                setLikeCounter(likes_count)
            } catch (error) {
                console.log(error)
            }


        } else {
            // it means like
            const prepData = {
                post: data.id,
                action: "LIKE",
            }
            try {
                const {likes_count} = await likeService(JSON.stringify(prepData))
                setLiked(true)
                setLikeCounter(likes_count)
            } catch (error) {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        setLiked(getLikeStatus())
        setLikeCounter(data?.likes?.counter)
    }, [data])

    const handleCommentClick = (id) => {
        handleComment(id)
        handleCommentDrawer()

    }


    return (
        <Card elevation={2} key={data?.id}>
            <CardHeader
                avatar={<Avatar>{data?.author?.member?.initial_name?.toUpperCase()}</Avatar>}
                title={data?.author?.member?.full_name}
                subheader={getNormalDate(data?.created_at)}/>
            <CardMedia
                sx={{height: "auto", maxHeight: {xs:300,sm:350,md:400,lg:450,xl:500}}}
                component={getComponent()}
                controls
                src={getFeaturedMedia(data?.medias) || "/default-picture.png"}
            />
            <CardContent>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                }}>
                    <Box sx={{display: "flex", gap: 1, alignItems: "start", justifyContent: "start"}}>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <IconButton size={"medium"} onClick={handleLike}>
                                {
                                    liked ? <Favorite fontSize={"medium"}/>
                                        : <FavoriteBorder fontSize={"medium"}/>
                                }
                            </IconButton>
                            <Typography variant={"caption"} component={"small"}>{likeCounter}</Typography>
                        </Box>
                        <IconButton size={"medium"} onClick={() => handleCommentClick(data.id)}>
                            <ModeCommentOutlined fontSize={"medium"}/>
                        </IconButton>
                    </Box>
                </Box>
                <Typography variant="body1" mt={1} fontWeight={500} color="text.secondary">
                    {data?.text}
                </Typography>
            </CardContent>
        </Card>
    )
}

const PostSkeleton = () => {
    return Array.from(Array(2)).map((item, index) => <Card key={index} elevation={2}>
            <CardHeader title={<Skeleton variant={"text"} width={"25%"}/>}
                        subheader={<Skeleton variant={"text"} width={"15%"}/>}
                        avatar={<Skeleton variant={"circular"} width={"40px"} height={"40px"}/>}/>
            <Skeleton sx={{height: {xs: 150, sm: 200, md: 300, lg: 440, xl: 540}}} width={"100%"} variant={"rectangular"}/>
            <CardContent>
                <Skeleton variant={"text"} width={"25%"} height={30}/>
                <Skeleton variant={"text"} width={"75%"} height={28}/>
            </CardContent>
            <CardActions sx={{px: 2, pb: 2}}>
                <Skeleton variant={"rounded"} width={"100px"} height={"30px"}/>
                <Skeleton variant={"rounded"} width={"100px"} height={"30px"}/>
            </CardActions>
        </Card>
    )
}


const EmptyPosts = ({handleDrawer}) => {
    return (
        <Card elevation={2}>
            <CardContent
                sx={{
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '20px',
                }}
            >
                <Box sx={{mb: 3}}>
                    <CardMedia
                        component="img"
                        src={EmptyImage}
                        alt="No posts available"
                        sx={{height: 400, width: 'auto'}}
                    />
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight={500}>
                        There are no posts to display
                    </Typography>
                    <Button sx={{mt: 1}} onClick={handleDrawer}>Create Post</Button>

                </Box>
            </CardContent>
        </Card>
    );
};
export default Home