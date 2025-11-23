import {END_POINTS} from "../../conf/index.js";
import {fetchWithAuth} from "@lib/services/index.js";


export const listService = async (family = null) => {
    let url = END_POINTS.posts.index
    if (family)
        url += `?family=${family}`
    return await fetchWithAuth(url, {
        method: "GET",
    })
}


export const createService = async (data) => {
    return  await fetchWithAuth(END_POINTS.posts.index, {
        method: "POST",
        body: data
    })
}


export const likeService = async (data) => {
    return  await fetchWithAuth(END_POINTS.posts.like, {
        method: "POST",
        body: data
    })
}