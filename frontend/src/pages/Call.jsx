import {useEffect, useState, useCallback} from "react";
import useWebSocket from "react-use-websocket";
import {parseData} from "@lib/utils/socket.js";
import {SOCKET_BASE_URL} from "@src/conf/index.js";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {useParams} from "react-router-dom";
import {Box, Button, Card, Stack, Typography} from "@mui/material";
import {
    RoomContext, VideoConference, LiveKitRoom,
} from "@livekit/components-react";
import {Room} from "livekit-client";
import {createLiveKitTokenService} from "@lib/services/chatService.js";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import {useUserContext} from "@lib/context/UserContext.jsx";

const Call = () => {
    const {room_id} = useParams();
    const [room] = useState(() => new Room({}));
    const [info, setInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(false)
    const [connected, setConnected] = useState(false);
    const {user} = useUserContext()
    const [accessToken] = useAccessToken();

    const SocketUrl = `${SOCKET_BASE_URL}/ws/videocall/${room_id}/?token=${accessToken}`;

    // --- WebSocket Setup ---
    const {sendJsonMessage} = useWebSocket(SocketUrl, {
            shouldReconnect: true,
            onOpen: () => console.log("WebSocket connected"),
            onClose: () => console.log("WebSocket closed"),
            onError: (e) => console.error("WebSocket error:", e),
            onMessage: (event) => {
                const [action, data] = parseData(event.data);
                handleSocketMessage(action, data);
            },
        },
        connected
    );

    // --- Handle messages coming from backend ---
    const handleSocketMessage = (action, data) => {
        switch (action) {
            case "joined_call":
                if (data.user === user.id)
                    return
                toast.error(`${data.username} joined the call.`)
                break;
            case "leave_call":
                if (data.user === user.id)
                    return
                toast.error(`${data.username} left the call.`)
                break;

            case "start_call":
                toast.success("Call has started");
                break;

            case "end_call":
                toast.info("Call has ended");
                break;
            case "offer":
            case "answer":
            case "ice_candidate":
                console.log(`Received signaling: ${action}`, data);
                // Normally you would integrate this with a PeerConnection if not using LiveKit
                break;

            case "mute":
            case "unmute":
                console.log(`${data.user} ${action}d`);
                break;
            default:
                console.warn("Unknown action:", action, data);
        }
    };

    // --- Send WebSocket events ---
    // const sendSignal = (action, payload = {}) => {
    //     sendJsonMessage({action, ...payload});
    // };

    // Fetch LiveKit token when room_id changes
    useEffect(() => {
        const fetchToken = async () => {
            try {
                setLoadingInfo(true)
                const response = await createLiveKitTokenService(JSON.stringify({room_id}));
                setInfo(response);
            } catch (err) {
                handleError(err)
            } finally {
                setLoadingInfo(false)
            }
        };
        fetchToken();
    }, [room_id]);


    const handleStartCall = useCallback(async () => {
        if (!info) return;

        try {
            await room.connect(info.livekit_url, info.token, {
                maxRetries: 5, rtcConfig: {iceServers: info?.ice_servers},
            });
            setConnected(true);
        } catch (err) {
            console.error("LiveKit connect error:", err);
        }
    }, [info, room]);

    const handleEndCall = () => {
        setConnected(false);
    };

    useEffect(() => {
        return () => {
            if (room) {
                room.disconnect();
                console.log("Disconnected from LiveKit room");
            }
        };
    }, [room]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: connected ? "#0b0c10" : "#f5f6fa",
                color: connected ? "#fff" : "#000",
                transition: "background-color 0.3s ease",
            }}
        >
            {!connected ? (
                // Lobby View
                <Stack
                    component={Card}
                    spacing={3}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        p: 4,
                    }}
                >
                    <Typography variant="h5" component="h2" sx={{mb: 1, textAlign: "center"}}>
                        Join Call
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{color: "text.secondary", textAlign: "center", m: 0}}
                    >
                        {info?.room_type === "private" && (
                            <>
                                You are about to join a <strong>private meeting</strong>.
                            </>
                        )}
                        {info?.room_type === "group" && (
                            <>
                                You are about to join a <strong>group meeting</strong>.
                            </>
                        )}
                        {info?.room_type === "family" && (
                            <>
                                You are about to join a <strong>family meeting</strong>.
                            </>
                        )}
                    </Typography>

                    <Button
                        onClick={handleStartCall}
                        variant="soft"
                        size="large"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            px: 4,
                            py: 1.2,
                        }}
                        disabled={loadingInfo || info === null}
                    >
                        {
                            loadingInfo ? (
                                "Preparing..."
                            ) : info ? (
                                "Join"
                            ) : (
                                "Unable to join the call"
                            )
                        }


                    </Button>
                </Stack>
            ) : (
                // Active Call View
                <RoomContext.Provider value={room}>
                    <LiveKitRoom
                        video
                        audio
                        token={info.token}
                        serverUrl={info.livekit_url}
                        connectOptions={{rtcConfig: {iceServers: info.ice_servers}}}
                        data-lk-theme="default"
                        onDisconnected={handleEndCall}
                    >
                        <VideoConference/>
                    </LiveKitRoom>
                </RoomContext.Provider>
            )}
        </Box>
    );
};

export default Call;
