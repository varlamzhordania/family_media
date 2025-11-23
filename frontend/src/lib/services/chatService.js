import {END_POINTS} from "@src/conf/index.js";
import {fetchWithAuth} from "@lib/services/index.js";

export const createService = async (data) => {
    return await fetchWithAuth(END_POINTS.chat.index, {
        method: "POST",
        body: data
    })
}

export const createLiveKitTokenService = async (data) => {
    return await fetchWithAuth(END_POINTS.chat.livekit.token, {
        method: "POST",
        body: data
    })
}


export const createGroupService = async (data) => {
    return await fetchWithAuth(END_POINTS.chat.room.createGroup, {
        method: "POST",
        body: data
    });

};

export const updateGroupInfoService = async (roomId, data) => {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.avatar) formData.append("avatar", data.avatar); // <- file

    return await fetchWithAuth(END_POINTS.chat.room.updateGroup(roomId), {
        method: "PATCH",
        body: formData,
    });
};
