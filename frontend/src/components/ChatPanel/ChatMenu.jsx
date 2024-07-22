import {ListItemIcon, MenuItem, Menu} from "@mui/material";
import {DANGER_STYLE} from "@lib/theme/styles.js";
import {Chat, Delete, Reply, ContentCopy, Edit} from "@mui/icons-material";
import {haveChatDeletePermission, isSender} from "@lib/utils/socket.js";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

const ChatMenu = ({
                      contextMenu,
                      setContextMenu,
                      handleModal,
                      handleClose,
                      selectMessage,
                      selected, setSelected,
                      user,
                      setReplyTo,
                      setEditing
                  }) => {
    const navigate = useNavigate()

    const handleDm = () => {
        setSelected(null)
        handleClose()
        navigate(`/message/?dm=${selectMessage?.user?.id}`)
    }
    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(selectMessage.content);
            toast.success("Copied to clipboard!")
            setContextMenu(null)
        } else {
            toast.error("It is not possible to access the clipboard.")
        }

    };
    const handleReply = () => {
        setReplyTo(selectMessage)
        setContextMenu(null)
    }

    const handleEdit = () => {
        setEditing(selectMessage)
        setContextMenu(null)
    }

    return (
        <Menu onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu(null)
        }}
              open={contextMenu !== null}
              PaperProps={{
                  elevation: 0,
                  sx: {
                      width: 185,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                      },
                  },
              }}
              onClose={handleClose}
              anchorReference="anchorPosition"
              anchorPosition={
                  contextMenu !== null
                      ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                      : undefined
              }
        >
            {
                selectMessage?.user?.id !== user?.id && selected?.type !== "private" &&
                <MenuItem onClick={handleDm} sx={{fontSize: "16px"}}>
                    <ListItemIcon>
                        <Chat fontSize={"small"}/>
                    </ListItemIcon>
                    Direct message
                </MenuItem>
            }

            <MenuItem sx={{fontSize: "16px"}} onClick={handleReply}>
                <ListItemIcon>
                    <Reply fontSize={"small"}/>
                </ListItemIcon>
                Reply
            </MenuItem>
            <MenuItem sx={{fontSize: "16px"}} onClick={copyToClipboard}>
                <ListItemIcon>
                    <ContentCopy fontSize={"small"}/>
                </ListItemIcon>
                Copy text
            </MenuItem>
            {
                isSender(selectMessage, user) &&
                <MenuItem sx={{fontSize: "16px"}} onClick={handleEdit}>
                    <ListItemIcon>
                        <Edit fontSize={"small"}/>
                    </ListItemIcon>
                    Edit
                </MenuItem>
            }

            {
                haveChatDeletePermission(selectMessage, selected, user) &&
                <MenuItem sx={{...DANGER_STYLE, fontSize: "16px"}} onClick={handleModal}>
                    <ListItemIcon>
                        <Delete fontSize={"small"}/>
                    </ListItemIcon>
                    Delete
                </MenuItem>
            }

        </Menu>
    )
}

export default ChatMenu