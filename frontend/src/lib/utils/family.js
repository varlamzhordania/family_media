import {findRelationByMemberId} from "@lib/utils/relations.js";

export const isAdmin = (member, query) => {
    return query?.data?.admins?.includes(member?.id)
}
export const isCreator = (member, query) => {
    return query?.data?.creator === member?.id
}

export const havePermission = (user, query) => {
    return isCreator(user, query) || isAdmin(user, query)
}

export const handleName = (relations, member) => {
    const myRelation = findRelationByMemberId(relations, member.id)
    return myRelation ? member.full_name + `(${myRelation.relation})` : member.full_name
}