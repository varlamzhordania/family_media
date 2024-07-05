import {useMemberships} from "@lib/hooks/useUser.jsx";
import {useEffect, useRef, useState} from "react";
import {likeService} from "@lib/services/postService.js";
import {
    Avatar,
    Box, Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    IconButton,
    Skeleton,
    Typography
} from "@mui/material";
import {getFormattedDate} from "@lib/utils/times.js";
import {Favorite, FavoriteBorder, ModeCommentOutlined, NavigateBefore, NavigateNext} from "@mui/icons-material";
import EmptyImage from "@public/empty.svg";
import {register} from 'swiper/element/bundle';
import VideoPlayer from "@components/VideoPlayer/VideoPlayer.jsx";

register();


export const PostCard = ({data, handleComment, handleCommentDrawer}) => {
    const [memberShips, _] = useMemberships()
    const [liked, setLiked] = useState(false)
    const [likeCounter, setLikeCounter] = useState(0)
    const swiperRef = useRef(null)

    const getExtension = (file) => {
        return file?.slice(-4)
    }

    const handleSlideNext = () => {
        swiperRef.current.swiper.slideNext();
    }
    const handleSlidePrev = () => {
        swiperRef.current.swiper.slidePrev();
    }

    const getComponent = (file) => {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'];
        const ext = getExtension(file)
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

    const swiperBtnStyle = {
        display: {xs: "none", md: "flex"},
        boxShadow: 5,
        position: "absolute",
        top: 0,
        bottom: 0,
        zIndex: 1000,
        margin: "auto",
        height: "fit-content"
    }
    const swiperWrapperHeight = {xs: 300, sm: 350, md: 400, lg: 450, xl: 500}

    return (
        <Card key={data?.id} sx={{overflow: "visible"}}>
            <CardHeader
                avatar={<Avatar>{data?.author?.member?.initial_name?.toUpperCase()}</Avatar>}
                title={data?.author?.member?.full_name}
                subheader={getFormattedDate(data?.created_at, {showDate: true, showTime: true})}/>
            <Box sx={{position: "relative", height: swiperWrapperHeight,}}>
                <swiper-container ref={swiperRef} slides-per-view="1"
                                  pagination="true"
                >
                    {data?.medias?.map((item, index) =>
                        <swiper-slide key={index}>
                            {
                                getComponent(item.file) === "img" ? <CardMedia
                                    sx={{
                                        height: swiperWrapperHeight,
                                        objectFit: "contain",
                                        backgroundColor: "#222"
                                    }}
                                    component={getComponent(item.file)}

                                    play={"false"}
                                    loading="lazy"
                                    src={item.file || "/default-picture.png"}
                                /> : <VideoPlayer src={item.file} cardStyle={swiperWrapperHeight}/>
                            }
                        </swiper-slide>
                    )}
                </swiper-container>
                <Box sx={{
                    position: "relative",
                    top: "-50%",
                    margin: "auto",
                    zIndex: 1001,
                }}>
                    <IconButton variant="soft" sx={{...swiperBtnStyle, right: {xs: 5, md: -20},}}
                                onClick={handleSlideNext}>
                        <NavigateNext fontSize={"large"}/>
                    </IconButton>
                    <IconButton variant="soft" sx={{...swiperBtnStyle, left: {xs: 5, md: -20},}}
                                onClick={handleSlidePrev}>
                        <NavigateBefore fontSize={"large"}/>
                    </IconButton>
                </Box>
            </Box>
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


export const PostSkeleton = () => {
    return Array.from(Array(2)).map((item, index) => <Card key={index}>
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

export const EmptyPosts = ({handleDrawer}) => {
    return (
        <Card>
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
                    <Button sx={{mt: 1}} variant={"soft"} onClick={handleDrawer}>Create Post</Button>

                </Box>
            </CardContent>
        </Card>
    );
};