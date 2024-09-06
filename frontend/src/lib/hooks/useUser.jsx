import useLocalStorage from '@lib/hooks/useLocalStorage';

export const USER_KEY = "user";
export const MEMBERSHIPS_KEY = "memberships";
export const FRIENDSHIPS_KEY = "friendships";
export const RELATIONS_KEY = "relations";

// Hook functions for User
export const useUser = () => {
    return useLocalStorage(USER_KEY, null);
};

export const useMemberships = () => {
    return useLocalStorage(MEMBERSHIPS_KEY, []);
};

export const useFriendships = () => {
    return useLocalStorage(FRIENDSHIPS_KEY, []);
};


export const useRelations = () => {
    return useLocalStorage(RELATIONS_KEY, []);
};
