import { expireSubscriptionJobs } from './subscription.jobs.js';

export function initCronJobs() {

    expireSubscriptionJobs();
}


