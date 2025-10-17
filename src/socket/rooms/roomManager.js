const roomManager = {
  joinUserRooms(socket) {
    const user = socket.user;
    if (!user) return;

    // room cá nhân riêng
    console.log(`🏠 User ${user.fullName} (${user.role}) joining rooms`);
    socket.join(`user-${user._id}`);
    //Room theo role
    switch (user.role) {
      case 'admin':
      case 'staff':
        socket.join('admin-room'); // staff và admin cùng nhận các thông báo quản trị
        break;
      case 'trainer':
        socket.join('trainer-room');
        break;
      case 'member':
        socket.join('member-room');
        break;
      default:
        socket.join('general-room');
        break;
    }
    // 🔹 Room theo chi nhánh (branch)
    const branchId =
      user.staffInfo?.brand_id ||
      user.adminInfo?.managed_branches?.[0] || // admin quản lý nhiều chi nhánh
      user.memberInfo?.current_brand_id;
    if (branchId) {
      const branchRoom = `branch-${branchId}`;
      socket.join(branchRoom);
      console.log(`🏢 User joined branch room: ${branchRoom}`);
    }
  },
  leaveAllRooms(socket) {
    console.log(`❌ User left all rooms`);
  }
};

export default roomManager;
