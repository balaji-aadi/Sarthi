import cron from 'node-cron';
import mongoose from 'mongoose';
import { PamphletSyncService } from './pamphletSync.service.js';

/**
 * Initializes the automated 2-day multi-arena DSA Pamphlet progress sync cron job.
 */
export const initPamphletSyncJob = () => {
    // Run every 2 days at midnight: '0 0 */2 * *'
    cron.schedule('0 0 */2 * *', async () => {
        if (mongoose.connection.readyState !== 1) return;
        console.log('[Cron Job] Executing 2-Day Automated Multi-Arena Pamphlet Progress Sync...');
        await PamphletSyncService.syncAllUsers();
    });

    // Execute sync after connection settles
    setTimeout(() => {
        if (mongoose.connection.readyState === 1) {
            PamphletSyncService.syncAllUsers().catch(e => console.error('[PamphletSync] Startup sync error:', e));
        }
    }, 5000);
};
