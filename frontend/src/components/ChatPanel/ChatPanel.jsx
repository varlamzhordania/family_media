import {
    Avatar, Badge,
    Box,
    Card,
    CardContent,
    CardHeader, IconButton,
} from "@mui/material";
import {getAvatar, getChatName, getOpponent, updateRoomLastMessage} from "@lib/utils/chat.jsx";
import {ArrowBack, Diversity2} from "@mui/icons-material";
import {HorizontalStyle, VerticalStyle} from "@lib/theme/styles.js";
import {useEffect, useRef, useState} from "react";
import {SOCKET_BASE_URL} from "@src/conf/index.js";
import useWebSocket from "react-use-websocket";
import {completeServerUrl, parseData} from "@lib/utils/socket.js";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import Chat from "@components/ChatPanel/Chat.jsx";
import {useSearchParams} from "react-router-dom";
import InputForm from "@components/ChatPanel/InputForm.jsx";
import ChatMenu from "@components/ChatPanel/ChatMenu.jsx";
import DeleteModal from "@components/ChatPanel/DeleteModal.jsx";
import {useUserContext} from "@lib/context/UserContext.jsx";
import {useRoomsContext} from "@lib/context/RoomsContext.jsx";

const ChatPanel = ({selected, setSelected, height, matches}) => {
    const {user} = useUserContext()
    const {setRooms} = useRoomsContext()
    const [accessToken] = useAccessToken()
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [contextMenu, setContextMenu] = useState(null);
    const [selectMessage, setSelectMessage] = useState(null)
    const [replyTo, setReplyTo] = useState(null);
    const [editing, setEditing] = useState(null);

    const [searchParams] = useSearchParams()
    const messageContainerRef = useRef(null);

    const room = searchParams.get("room")

    const SocketUrl = `${SOCKET_BASE_URL}/ws/chat/${selected?.id || room || 0}/?token=${accessToken}`;

    const {sendJsonMessage, lastJsonMessage} = useWebSocket(SocketUrl, {
        shouldReconnect: () => true,
        onMessage: (event) => {
            const [action, data] = parseData(event.data);

            switch (action) {
                case "pull_history":
                    const reversedData = [...data].reverse();
                    setMessages(reversedData);
                    sendReadSignal(reversedData);
                    break;
                case "new_message":
                    setMessages((prevState) => {
                        const exists = prevState.find(item => item.id === data.id);
                        if (!exists) {
                            return [...prevState, data];
                        }
                        return prevState;
                    });
                    setRooms(prevRooms => updateRoomLastMessage(prevRooms, data));
                    sendReadSignal([data])
                    break;
                case "edit_message":
                    setMessages((prevState) => {
                        const exists = prevState.find(item => item.id === data.id);
                        if (exists) {
                            return prevState.map(item => item.id === data.id ? data : item);
                        }
                        return [...prevState, data];
                    });
                    break;
                case "delete_message":
                    setMessages(prevState => {
                        return prevState.filter(item => item.id !== data)
                    })
                    break;
                case "read_messages":
                    updateMessagesRead(data)
                    break;
                case "typing":
                    setIsTyping(prevState => {
                        if (prevState && !prevState.find(item => item === data.user)) {
                            return [...prevState, data.user];
                        }
                        return prevState ? prevState : [data.user];
                    });

                    break
                case "stop_typing":
                    setIsTyping(prevState => prevState.filter(item => item !== data.user))
                    break
                default:
                    console.log("Unknown action on message", action);
                    break;
            }
        },
    });


    const sendReadSignal = (data = []) => {
        const unReadedMessages = data.filter(item => !item.have_read.includes(user.id))
        if (unReadedMessages.length > 0) {
            const prepData = {
                action: "read_messages",
                messages: unReadedMessages
            }
            sendJsonMessage(prepData)
        }
    }

    const updateMessagesRead = (data) => {
        setMessages((prevState) => {
            // Create a copy of the current messages state
            const updatedMessages = [...prevState];

            // Loop through the incoming data and update the read status of the corresponding messages
            data.forEach(newMessage => {
                const index = updatedMessages.findIndex(msg => msg.id === newMessage.id);
                if (index !== -1) {
                    updatedMessages[index] = newMessage;
                }
            });

            // Return the updated messages state
            return updatedMessages;
        });
    };


    const handleClose = () => {
        setContextMenu(null);
        setShowModal(false)
    };
    const handleModal = () => {
        setShowModal(prevState => !prevState)
    }

    const handleDelete = () => {
        const prepData = {
            action: "delete_message",
            message: selectMessage.id

        }
        sendJsonMessage(prepData)
        handleClose()
    }

    const handleBack = () => {
        setSelected(null)
    }


    useEffect(() => {
        const action = lastJsonMessage?.action
        if (action !== "delete_message")
            scrollEnd()
    }, [messages]);

    const scrollEnd = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };


    return (
        <Card elevation={0} sx={{borderLeft: "2px solid rgba(0,0,0,0.1)", height: height, borderRadius: 0}}>
            {
                selected &&
                <CardHeader sx={{borderBottom: "2px solid rgba(0,0,0,0.1)"}}
                            avatar={

                                selected.type === "private" ?
                                    <Badge variant={"dot"} overlap={"circular"}
                                           color={getOpponent(selected, user).is_online ? "success" : "unset"}
                                           anchorOrigin={{
                                               vertical: 'bottom',
                                               horizontal: 'right',
                                           }}>
                                        <Box sx={{...HorizontalStyle, gap: 1}}>
                                            {
                                                matches === false &&
                                                <IconButton onClick={handleBack}><ArrowBack/></IconButton>
                                            }

                                            <Avatar src={completeServerUrl(getAvatar(selected, user))}
                                                    alt={selected?.title}>
                                                <Diversity2/>
                                            </Avatar>
                                        </Box>

                                    </Badge>
                                    :
                                    <Box sx={{...HorizontalStyle, gap: 3}}>
                                        {
                                            matches === false &&
                                            <IconButton onClick={handleBack}><ArrowBack/></IconButton>
                                        }
                                        <Avatar src={completeServerUrl(getAvatar(selected, user))}
                                                alt={selected?.title}>
                                            <Diversity2/>
                                        </Avatar>
                                    </Box>

                            }
                            title={getChatName(selected, user)}
                            titleTypographyProps={{variant: "h5", fontWeight: "bold"}}
                            subheader={isTyping?.length > 0 ? isTyping?.join(", ") + " is typing..." : ""}
                            subheaderTypographyProps={{variant: "caption"}}
                />
            }
            {
                selected ?
                    <CardContent sx={{...VerticalStyle, position: "relative", height: "91%",}}>
                        <Box ref={messageContainerRef}
                             sx={{
                                 display: "block",
                                 flexGrow: 1,
                                 width: "100%",
                                 overflowY: "auto",
                                 scrollbarGutter: "stable both-edges",
                                 paddingRight: 1
                             }}>
                            {messages.map((item, index) =>
                                <Chat data={item} selected={selected}
                                      contextMenu={contextMenu} setContextMenu={setContextMenu}
                                      setSelectMessage={setSelectMessage}
                                      setReplyTo={setReplyTo}
                                      user={user}
                                      key={index}

                                />
                            )}
                        </Box>
                        <Box sx={{width: "100%"}}>
                            <InputForm selected={selected} sendJsonMessage={sendJsonMessage} replyTo={replyTo}
                                       setReplyTo={setReplyTo} setEditing={setEditing}
                                       editing={editing}
                            />
                        </Box>

                    </CardContent>
                    : <NotSelected/>
            }
            <DeleteModal showModal={showModal} handleClose={handleClose} handleDelete={handleDelete}/>
            <ChatMenu contextMenu={contextMenu} setContextMenu={setContextMenu} handleModal={handleModal}
                      handleClose={handleClose} user={user}
                      selected={selected} setSelected={setSelected} selectMessage={selectMessage}
                      replyTo={replyTo} setReplyTo={setReplyTo}
                      setEditing={setEditing}
            />

        </Card>
    )
}


const NotSelected = () => {
    return (
        <CardContent>
            <Box sx={VerticalStyle}>
                <img src={"/Chat-bot-bro.svg"} alt={"select a chat"}/>
            </Box>
        </CardContent>
    )
}

export default ChatPanel