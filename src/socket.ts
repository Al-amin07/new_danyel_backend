// src/socket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Message } from './modules/message/message.model';

let io: SocketIOServer;

const onlineUsers: Record<string, string> = {}; // userId -> socketId

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

    socket.on('send_message', async (data) => {
      const { senderId, receiverId, text } = data;

      try {
        // 1️⃣ Save to database
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          text,
        });

        // 2️⃣ Send real-time to receiver (if online)
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', {
            _id: message._id,
            senderId,
            receiverId,
            text: message.text,
            createdAt: message.createdAt,
          });
        }

        // 3️⃣ Optionally: also send back to sender (to update UI instantly)
        socket.emit('message_saved', {
          _id: message._id,
          senderId,
          receiverId,
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('❌ Error saving message:', err);
        socket.emit('message_error', { error: 'Message could not be saved' });
      }
    });

    // Send message
    // socket.on('send_message', async (data) => {
    //   const { senderId, receiverId, text } = data;
    //   console.log({ from: data });
    //   const receiverSocketId = onlineUsers[receiverId];

    //   if (receiverSocketId) {
    //     console.log('Event trigger', receiverSocketId);
    //     io.to(receiverSocketId).emit('receive_message', { senderId, text });
    //   }
    // });

    // Send notification
    socket.on('send_notification', (data) => {
      const { receiverId, content } = data;
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_notification', { content });
      }
    });

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
