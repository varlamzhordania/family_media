import {Box, Button, CardMedia} from "@mui/material";
import {useRef, useState} from "react";

const VideoPlayer = ({src, cardStyle, loading = "lazy"}) => {
    const [play, setPlay] = useState(false)
    const videoRef = useRef(null)


    const handlePlay = () => {
        if (videoRef.current.paused || videoRef.current.ended) {
            videoRef.current.play();
            setPlay(true)
        } else {
            videoRef.current.pause();
            setPlay(false)
        }
    }

    return (
        <>
            <CardMedia
                ref={videoRef}
                sx={{
                    height: cardStyle,
                    objectFit: "contain",
                    backgroundColor: "#222"
                }}
                component={"video"}
                play={"false"}
                loading={loading}
                src={src}
            />
            <Box sx={{position: "absolute", width: "100%", height: "100%", top: 0, left: 0}}>
                <Button color={"grey"} sx={{width: "100%", height: "100%"}} title="Toggle Play" onClick={handlePlay}>
                </Button>
            </Box>
        </>

    )
}

export default VideoPlayer