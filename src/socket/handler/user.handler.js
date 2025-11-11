const userHandler = (socket, getOnlineUsersSnapshot) => {
  socket.on('get-online-users', () => {
    socket.emit('online-users-response', getOnlineUsersSnapshot());
  });
};

export default userHandler;