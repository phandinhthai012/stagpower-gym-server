const userHandler = (socket, io, onlineUsers, onlineMembers) => {
    socket.on('get-online-users', () => {
        socket.emit('online-users-response', {
            totalOnlineUsers: onlineUsers.size,
            totalOnlineMembers: onlineMembers.size,
            byRole: {
                admin: Array.from(onlineUsers.values()).filter(u => u.role === 'admin').length,
                staff: Array.from(onlineUsers.values()).filter(u => u.role === 'staff').length,
                trainer: Array.from(onlineUsers.values()).filter(u => u.role === 'trainer').length,
                member: Array.from(onlineUsers.values()).filter(u => u.role === 'member').length
            },
            users: Array.from(onlineUsers.values()),
            members: Array.from(onlineMembers.values())
        });
    });
}


export default userHandler;