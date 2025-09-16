import cron from 'node-cron';
import { AvatarService } from './avatarService.js';
import { UserNodeModel } from '../models/index.js';
import pino from 'pino';

const logger = pino({ level: 'info' });

export class SchedulerService {
  private static isInitialized = false;

  /**
   * Initialize scheduled tasks
   */
  static initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Clean up old avatars daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting daily avatar cleanup...');
      try {
        await AvatarService.cleanupOldAvatars();
        logger.info('Daily avatar cleanup completed');
      } catch (error) {
        logger.error('Error during daily avatar cleanup:', error);
      }
    });

    // Refresh Google avatars every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Starting Google avatar refresh...');
      try {
        await this.refreshAllGoogleAvatars();
        logger.info('Google avatar refresh completed');
      } catch (error) {
        logger.error('Error during Google avatar refresh:', error);
      }
    });

    this.isInitialized = true;
    logger.info('Scheduler service initialized');
  }

  /**
   * Refresh all Google avatars for active users
   */
  private static async refreshAllGoogleAvatars(): Promise<void> {
    try {
      // Find all users with Google avatars
      const users = await UserNodeModel.find({
        avatar: { $regex: /googleusercontent\.com|googleapis\.com/ },
        isActive: true,
        deletedAt: null
      });

      logger.info(`Found ${users.length} users with Google avatars to refresh`);

      // Refresh avatars in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (user) => {
            try {
              if (user.avatar) {
                await AvatarService.refreshAvatarCache(user.avatar);
                logger.debug(`Refreshed avatar for user ${user._id}`);
              }
            } catch (error) {
              logger.error(`Failed to refresh avatar for user ${user._id}:`, error);
            }
          })
        );

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      logger.error('Error refreshing Google avatars:', error);
      throw error;
    }
  }

  /**
   * Manually trigger avatar refresh for all users
   */
  static async triggerAvatarRefresh(): Promise<void> {
    logger.info('Manually triggering avatar refresh...');
    await this.refreshAllGoogleAvatars();
  }

  /**
   * Manually trigger avatar cleanup
   */
  static async triggerAvatarCleanup(): Promise<void> {
    logger.info('Manually triggering avatar cleanup...');
    await AvatarService.cleanupOldAvatars();
  }
}
