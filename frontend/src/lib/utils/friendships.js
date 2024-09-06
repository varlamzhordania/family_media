export const IsFriend = (me, user, frinds) => {
    return frinds.some(item => item?.id === user?.id)
}