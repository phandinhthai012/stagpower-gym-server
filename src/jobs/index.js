import { expireSubscriptionJobs } from './subscription.jobs.js';
import { autoUnsuspendSubscription } from './subscription.jobs.js';

export function initCronJobs() {

    expireSubscriptionJobs();
    autoUnsuspendSubscription();
}


