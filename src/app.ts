import express from 'express';
import cors from 'cors';
import path from 'path';
import { startWorker } from './queue/reminder.queue';
import reminderRouter from './router';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', reminderRouter);

// Serve static files from src/audio at /audio
app.use('/audio', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=360000'); 
  // console.log('Request:', {
  //   method: req.method,
  //   url: req.url,
  //   headers: req.headers,
  //   body: req.body,
  //   ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  // });
  res.setHeader('Content-Type', 'audio/wav'); 
  next();
}, express.static(path.join(__dirname, 'audio')));

// 31536000 // 1 year

// Start worker in same process (for dev)
if (process.env.NODE_ENV !== 'production') {
  startWorker();
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});