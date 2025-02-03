import { Server } from 'socket.io';

const io = new Server({
  cors: {
    origin: '*', // Allow frontend access
  }
});

io.on('connection', socket => {
  console.log('🟢 Client connected:', socket.id);
});

export { io };
