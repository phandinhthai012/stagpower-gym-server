import {
    expireSubscriptionJobs,
    autoUnsuspendSubscription,
    informSubscriptionIscomingToExpire
} from './subscription.jobs.js';
import { expireOldBookingRequests } from './booking.jobs.js';
import { autoCheckoutStaleCheckins } from './checkIn.jobs.js';

export function initCronJobs() {
    // subscription jobs
    expireSubscriptionJobs();
    autoUnsuspendSubscription();
    informSubscriptionIscomingToExpire();
    // booking jobs
    expireOldBookingRequests();
    // checkIn jobs
    autoCheckoutStaleCheckins();
}


