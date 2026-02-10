import cron from 'node-cron';
import db from './db.mjs';
import * as aws from './aws-service.mjs';

export function initScheduler() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const day = now.getDay(); // 0-6 (Sun-Sat)
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const activeSchedules = db.prepare('SELECT * FROM schedules WHERE is_active = 1').all();

        for (const schedule of activeSchedules) {
            const days = schedule.days.split(',').map(Number);
            if (!days.includes(day)) continue;

            const role = db.prepare('SELECT * FROM aws_roles WHERE user_id = ? AND is_active = 1').get(schedule.user_id);
            if (!role) continue;

            try {
                const creds = await aws.assumeClientRole(role.role_arn, role.region);

                if (time === schedule.start_time) {
                    console.log(`[Scheduler] Starting instance ${schedule.instance_id} for user ${schedule.user_id}`);
                    await aws.startStopInstance(creds, schedule.instance_id, 'start', role.region);
                } else if (time === schedule.stop_time) {
                    console.log(`[Scheduler] Stopping instance ${schedule.instance_id} for user ${schedule.user_id}`);
                    await aws.startStopInstance(creds, schedule.instance_id, 'stop', role.region);
                }
            } catch (err) {
                console.error(`[Scheduler] Error for user ${schedule.user_id}:`, err.message);
            }
        }
    });
}
