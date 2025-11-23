import {END_POINTS} from "@src/conf/index.js";
import {fetchWithAuth} from "@lib/services/index.js";


export const userService = async () => {
    const {user, memberships, friends} = await fetchWithAuth(END_POINTS.accounts.user, {
        method: "GET",
    })
    return [user, memberships, friends]
}
export const userPatchService = async (data) => {
    return await fetchWithAuth(END_POINTS.accounts.user, {
        method: "PATCH",
        body: data
    })
}

export const relationListService = async () => {
    return await fetchWithAuth(END_POINTS.accounts.relations, {
        method: "GET",
    })
}

export const relationUpdateOrCreateService = async (data, id = 0) => {
    return await fetchWithAuth(END_POINTS.accounts.relationsByID(id), {
        method: "PATCH",
        body: data
    })
}


export const friendshipsListService = async () => {
    return await fetchWithAuth(END_POINTS.accounts.friendShipsRequests, {
        method: "GET",
    })
}

export const friendshipsSendRequestService = async (data, id = 0) => {
    return  await fetchWithAuth(END_POINTS.accounts.friendShipsRequestsByID(id), {
        method: "POST",
        body: data
    })
}