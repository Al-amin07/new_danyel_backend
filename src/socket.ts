// src/socket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Message } from './modules/message/message.model';

let io: SocketIOServer;

export const onlineUsers: Record<string, string> = {}; // userId -> socketId

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // frontend URL
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    // Register user
    socket.on('register', (userId: string) => {
      onlineUsers[userId] = socket.id;
      console.log(`✅ User ${userId} registered`);
    });

    // socket.on('send_message', async (data) => {
    //   const { senderId, receiverId, text } = data;
    //   console.log({ senderId, receiverId, text });
    //   try {
    //     const message = await Message.create({
    //       sender: senderId,
    //       receiver: receiverId,
    //       text,
    //     });
    //     const receiverSocketId = onlineUsers[receiverId];
    //     if (receiverSocketId) {
    //       io.to(receiverSocketId).emit('receive_message', {
    //         _id: message._id,
    //         senderId,
    //         receiverId,
    //         text: message.text,
    //         createdAt: message.createdAt,
    //       });
    //     }
    //   } catch (err) {
    //     console.error('❌ Error saving message:', err);
    //     socket.emit('message_error', { error: 'Message could not be saved' });
    //   }
    // });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);
      Object.keys(onlineUsers).forEach((userId) => {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      });
    });
  });

  return io;
};

// Export io for emitting events from other files
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
