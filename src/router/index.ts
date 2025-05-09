import express from 'express';
import multer from 'multer';
import { createReminder, hello, fetchJobs } from '../services/reminder.service';
import { fetchAllJobs } from '../queue/reminder.queue';

const reminderRouter = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

reminderRouter.get('', hello)
reminderRouter.post('/reminder', createReminder);
reminderRouter.get('/get-all-jobs', fetchJobs)

export default reminderRouter;
