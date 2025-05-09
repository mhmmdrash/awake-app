import { Request, Response } from 'express';
import { calculateAndAddReminderJob } from './service';

/**  
* This Service adds a reminder to the system
* it basically takes the reminder and puts in the reminder queue
* workers then pick the reminder off the queue and process it
*/
export async function createReminder(req: Request, res: Response) {
    console.log('STARTED createReminder');
    console.log('Received createReminder request:', req.body);
    try {
        const { job, scheduledTime } = await calculateAndAddReminderJob(req.body) 

        console.log('Reminder job created:', {
            jobId: job.id,
            scheduledTime: scheduledTime.toISOString()
        });

        res.status(201).json({
            message: "Reminder added Successfully",
            reminderId: job.id,
            scheduledAt: scheduledTime.toISOString(),
        });
        return;
    } catch (error) {
        console.error('Error in createReminder:', error);
        res.status(500).json({ error: 'Failed to create reminder' });
        return;
    }
}
