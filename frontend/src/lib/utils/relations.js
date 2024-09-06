export const findRelationByMemberId = (relations, memberId) => {
    return relations?.find(relation => relation?.related === memberId);
};
