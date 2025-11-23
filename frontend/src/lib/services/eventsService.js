import {END_POINTS} from "@src/conf/index.js";
import {fetchWithAuth} from "@lib/services/index.js";

export const listService = async (id = null) => {
    let url = END_POINTS.events.index
    if (id)
        url += `?family=${id}`

    return await fetchWithAuth(url, {
        method: "GET",
    })
}

export const createService = async (data) => {
    let url = END_POINTS.events.index

    return await fetchWithAuth(url, {
        method: "POST",
        body: data
    })
}

export const patchService = async (data, id) => {
    let url = END_POINTS.events.byID(id)

    return await fetchWithAuth(url, {
        method: "PATCH",
        body: data
    })
}
export const deleteService = async (id) => {
    let url = END_POINTS.events.byID(id)

    return await fetchWithAuth(url, {
        method: "DELETE",
    })
}


export const sendInvitationService = async (data) => {
    let url = END_POINTS.events.invitation

    return await fetchWithAuth(url, {
        method: "POST",
        body: data
    })
}
export const checkInvitationService = async (code) => {
    let url = `${END_POINTS.events.invitation}?code=${code}`

    return  await fetchWithAuth(url, {
        method: "GET",
    })
}

