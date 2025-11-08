import 'dotenv/config'
import express from 'express'
import sequelize from './config/db.js'
import authRoute from './route/authRoute/auth.route.js'
import workersRoute from './route/authRoute/workers.route.js'
import shiftRoute from './route/authRoute/shift.route.js'
import notificationRoute from './route/authRoute/notification.route.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

// import associations before routes and sync
import "./models/modelRelation.model.js"; // this ensures User and Shift knows each other
import "./models/notificationUserRelation.js"

const PORT = process.env.PORT || 8002

const app = express()
app.use(express.json())
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',          // local dev
  'https://shift-sch.netlify.app'   // production frontend
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));


app.use('/api/auth', authRoute)
app.use('/api/worker', workersRoute)
app.use('/api/shift', shiftRoute)
app.use('/api/notice', notificationRoute)

app.use(errorHandler)

sequelize.sync({}).then(()=>{
    app.listen(PORT, ()=>{
        console.log(`app listening on port ${PORT}`)
    })
})