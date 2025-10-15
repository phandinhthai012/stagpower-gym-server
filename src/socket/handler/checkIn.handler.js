import CheckIn from '../../models/CheckIn';
import socketService from '../../services/socket.service';

const checkInHandler = (socket, io) => {
  socket.on('get-active-members-checkIn', async (data) => {
    try {
      const { branchId } = data;
      const query = { status: 'Active' };
      if (branchId) query.branchId = branchId;
      const checkIns = await CheckIn.find(query).populate('memberId', 'fullName email phone')
      socket.to('admin-room').emit('active-members-checkIn-response', checkIns);
      socket.to('trainer-room').emit('active-members-checkIn-response', checkIns);
    } catch (error) {
      console.error(error);
      socket.to('admin-room').emit('active-members-checkIn-response', { error: 'Error fetching active members checkIn' });
      socket.to('trainer-room').emit('active-members-checkIn-response', { error: 'Error fetching active members checkIn' });
    }
  });


}


export default checkInHandler;