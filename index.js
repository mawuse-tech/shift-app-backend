import 'dotenv/config';
import express from 'express';
import sequelize from './config/db.js';
import authRoute from './route/authRoute/auth.route.js';
import workersRoute from './route/authRoute/workers.route.js';
import shiftRoute from './route/authRoute/shift.route.js';
import notificationRoute from './route/authRoute/notification.route.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// import associations before routes
import "./models/modelRelation.model.js";
import "./models/notificationUserRelation.js";

console.log("LIVE_FRONTEND_URL:", process.env.LIVE_FRONTEND_URL);

const PORT = process.env.PORT;
const app = express();

//Middleware
  app.use(express.json());
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(cookieParser());

const allowedOrigins = [
  'https://sche.up.railway.app'
];

//  app.use(cors({
//    origin: 'http://localhost:5173',
//    credentials: true
//  }));
 
// const allowedOrigins = [
//   "http://localhost:5173",        // local dev
// ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

//API Routes
app.use('/api/auth', authRoute);
app.use('/api/worker', workersRoute);
app.use('/api/shift', shiftRoute);
app.use('/api/notice', notificationRoute);

// Serve React frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'dist')));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handler
app.use(errorHandler);

// Sync DB and start server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
});
 