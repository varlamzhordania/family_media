import {API_BASE_URL} from "@src/conf/index.js";

export const parseData = (data) => {
    const parsedData = JSON.parse(data)
    return [parsedData.action, parsedData.results]
}

export const completeServerUrl = (url) => {
    return API_BASE_URL + url
}

export const isAdmin = (room, user) => {
    return room?.family?.admins?.includes(user?.id)
}
export const isCreator = (room, user) => {
    return (room?.family?.creator === user?.id || room?.created_by === user.id) && room.type !== "private"
}

export const isSender = (message, user) => {
    return message?.user?.id === user?.id
}


export const haveChatDeletePermission = (message, room, user) => {
    return isCreator(room, user) || isAdmin(room, user) || isSender(message, user)
}