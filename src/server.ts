import mongoose from 'mongoose';
import app from './app';
import { Server } from 'http';
// import adminSeeder from './seeder/adminSeeder';
import config from './config';

let server: Server;

async function main() {
  try {
    console.log('Connecting to MongoDB... ⏳');
    await mongoose.connect(config.mongoose_uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected!');

    // await adminSeeder();

    server = app.listen(config.port, () => {
      console.log(`APP NAME server app listening on port ${config.port}`);
    });
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
