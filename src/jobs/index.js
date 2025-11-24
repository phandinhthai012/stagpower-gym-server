import {
    expireSubscriptionJobs,
    autoUnsuspendSubscription,
    informSubscriptionIscomingToExpire
} from './subscription.jobs.js';
import { expireOldBookingRequests } from './booking.jobs.js';
import { autoCheckoutStaleCheckins } from './checkIn.jobs.js';
import { autoUpdateSchedules, handleDailyScheduleJobs } from './schedule.jobs.js';
import { keepServerAlive } from './server.jobs.js';

export function initCronJobs() {
    // server jobs
    keepServerAlive();
    // subscription jobs
    expireSubscriptionJobs();
    autoUnsuspendSubscription();
    informSubscriptionIscomingToExpire();
    // booking jobs
    expireOldBookingRequests();
    // checkIn jobs
    autoCheckoutStaleCheckins();
    // schedule jobs
    autoUpdateSchedules();
    handleDailyScheduleJobs();
}


