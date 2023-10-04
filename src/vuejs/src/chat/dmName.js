export function getChatUserName(chat, userInfo) {
    if (chat && chat.users && chat.users.length) {
        const otherUser = chat.users.find(u => !userInfo || u.username !== userInfo.username);
        return otherUser ? otherUser.username : "Unknown";
    }
    return "Unknown";
}

export function getChatUserId(chat, userInfo) {
    if (chat && chat.users && chat.users.length) {
        const otherUser = chat.users.find(u => !userInfo || u.id !== userInfo.id);
        return otherUser ? otherUser.id : "Unknown";
    }
    return "Unknown";
}