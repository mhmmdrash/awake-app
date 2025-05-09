import { reminderQueue } from '../../queue/reminder.queue'; 
import { CreateReminderDto, Hm, Weekday } from '../../types';
import { PrismaClient } from '@prisma/client';

export async function calculateAndAddReminderJob(data: CreateReminderDto) {
    console.log('Calculating and adding reminder job with data:', data);
    try {
        const {type, scheduledAt, timeOfDay, daysOfWeek, userId, phoneNumber, timezone, delayInSeconds} = data

        // 1. Calculate delay in ms
        let scheduledTime: Date | null = null;
        let delay = 0;

        if (type === 'onetime' && scheduledAt) {
            scheduledTime = new Date(scheduledAt);
            console.log('One-time reminder scheduled for:', scheduledTime.toISOString());
        } else if (type === 'recurring' && timeOfDay && daysOfWeek) {
            // Calculate next occurrence based on timeOfDay and daysOfWeek
            scheduledTime = nextScheduledDate(daysOfWeek, timeOfDay)
            console.log('Recurring reminder next scheduled for:', scheduledTime.toISOString());
        } else {
            console.error('Incorrect reminder type or missing fields:', { type, scheduledAt, timeOfDay, daysOfWeek });
            throw new Error('Incorrect reminder type')
        }
        
        if (!scheduledTime) {
            console.error('Scheduled time is null');
            throw new Error("Scheduled time is required");
        }
        if (scheduledTime < new Date()) {
            console.error('Scheduled time is in the past:', scheduledTime.toISOString());
            throw new Error('Scheduled time must be in the future');
        }

        // Calculate delay in milliseconds
        // delay = scheduledTime.getTime() - Date.now();
        delay = delayInSeconds ? delayInSeconds * 1000 : scheduledTime.getTime() - Date.now();
        console.log('Calculated delay (ms):', delay);

        // 2. Fetch a random audio record
        const randomAudio: any = await getRandomAudio();
        console.log('Selected random audio:', randomAudio);

        // 3. Add to queue
        const job = await reminderQueue.add(
            'reminder-call',
            {
                reminderId: `rem-${Date.now()}`,
                userId,
                phoneNumber,
                audioFileUrl: randomAudio,
                metadata: {
                    type,
                    timeOfDay,
                    daysOfWeek,
                    timezone
                }
            },
            { delay }
        );

        console.log('Job added to queue:', job.id);

        return { job, scheduledTime };
    } catch (error) {
        console.error('Error in calculateAndAddReminderJob:', error);
        throw error;
    }
}

export function nextScheduledDate(
    days: Weekday[],
    { hours, minutes }: Hm
): Date {
    console.log('Calculating next scheduled date for days:', days, 'at', hours, ':', minutes);
    if (days.length === 0) {
        console.error('days array must contain at least one weekday');
        throw new Error("days array must contain at least one weekday");
    }

    // Deduplicate & sort to keep logic simple
    const wanted = Array.from(new Set(days)).sort((a, b) => a - b) as Weekday[];

    const now     = new Date();
    const todayWd = now.getDay() as Weekday;

    // Build "candidate" Date for TODAY at HH:MM
    const todayAtTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0,
        0
    );

    // Helper: how many days forward from today to reach a given weekday
    const diffDays = (targetWd: Weekday): number =>
        (targetWd - todayWd + 7) % 7;

    // Step 1 – check today first (only if today's weekday is requested *and*
    // the target time is still in the future)
    if (wanted.includes(todayWd) && todayAtTime > now) {
        console.log('Next scheduled date is today at', todayAtTime.toISOString());
        return todayAtTime; // later today
    }

    // Step 2 – iterate through requested weekdays to find the soonest one
    // after today
    let minDelta = Number.POSITIVE_INFINITY;
    for (const wd of wanted) {
        const delta = diffDays(wd) || 7; // 0 => next week's same day
        if (delta < minDelta) minDelta = delta;
    }

    // Build the final Date by adding minDelta days to todayAtTime
    const next = new Date(todayAtTime);
    next.setDate(next.getDate() + minDelta);
    console.log('Next scheduled date is', next.toISOString());
    return next;
}

async function getRandomAudio(): Promise<string> {
    console.log('Fetching random audio...');
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const prisma = new PrismaClient();
    const count = await prisma.audioLibrary.count();
    const randomIndex = Math.floor(Math.random() % count);
    const randomAudio: any = await prisma.audioLibrary.findFirst({
        skip: randomIndex,
    });
    return randomAudio;
}
