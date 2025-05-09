// export interface CreateReminderDto {
//   userId: string;
//   phoneNumber: string;
//   scheduledAt: Date;
//   timezone: string;
//   audioFile?: Express.Multer.File 
// }

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;      // Sun … Sat
export type Hm      = { hours: number; minutes: number };

export interface CreateReminderDto {
  userId: string;
  phoneNumber: string;
  type: 'onetime' | 'recurring';
  scheduledAt?: string;
  timeOfDay?: TimeOfDay;
  daysOfWeek?: Weekday[];      // 0 (Sunday) to 6 (Saturday), e.g. [1,3,5] for Mon, Wed, Fri
  timezone?: string;
  delayInSeconds?: number;
}

interface TimeOfDay {
  hours: number;
  minutes: number;
}

export interface ReminderJobData {
  reminderId: string;
  userId: string;
  phoneNumber: string;
  audioFileUrl: string;
  metadata: any;
}