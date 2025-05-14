import { Queue, Worker } from 'bullmq';
import { config } from '../config';
import { TelephonyService } from '../services/telephony.service'
import { ReminderJobData } from '../types';
import { calculateAndAddReminderJob } from '../services/reminder.service';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password, // add this line
  username: config.redis.username, // add this line
};

console.log('Connecting to Redis at', config.redis.host, config.redis.port);
export const reminderQueue = new Queue<ReminderJobData>('reminders', { connection });

// Utility function to fetch all jobs in the queue
export async function fetchAllJobs() {
  // You can adjust the statuses as needed
  const jobs = await reminderQueue.getJobs(
    ['waiting', 'active', 'completed', 'failed', 'delayed'],
    0,
    -1
  );
  return jobs;
}

export function startWorker() {
  console.log('Starting reminder worker...');
  const worker = new Worker<ReminderJobData>(
    'reminders',
    async job => {
      console.log('WORKER | Processing job:', job.id);
      const { phoneNumber, audioFileUrl, metadata, userId } = job.data;

      // making the twilio call with retry logic
      const telephony = new TelephonyService();
      let attempt = 0;
      const maxRetry = 3;
      let success = false;
      let lastError: any = null;

      while (attempt < maxRetry && !success) {
        try {
          await telephony.initiateCall(phoneNumber, audioFileUrl);
          success = true;
        } catch (err) {
          attempt++;
          lastError = err;
          if (attempt < maxRetry) {
            console.warn(`Call attempt ${attempt} failed, retrying...`);
          }
        }
      }

      if (!success) {
        throw lastError;
      }

      // if the job is a recurring one then need to calculate new schedule time and add back to queue
      if (metadata.type === 'recurring') {
        const { job , scheduledTime } = await calculateAndAddReminderJob({
          userId,
          phoneNumber,
          ...metadata
        })

        console.log({
          message: "New Reminder added Successfully",
          reminderId: job.id,
          scheduledAt: scheduledTime.toISOString(),
        })
      }
    },
    { connection }
  );

  worker.on('completed', job => {
    console.log(`Reminder ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Reminder ${job?.id} failed:`, err);
  });

  return worker;
}