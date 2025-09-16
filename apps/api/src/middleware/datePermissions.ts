import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler.js';

/**
 * Date-based permission rule: Allow write operations only on the 15th of any month
 */
export const requireWritePermissions = (req: Request, res: Response, next: NextFunction) => {
  // Check if write operations are currently permitted
  if (!isWritePermitted()) {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const error = createError(
      `Write operations are only permitted on the 15th of any month. Today is the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}.`,
      403
    );
    return next(error);
  }
  
  // If it's the 15th, allow the operation
  next();
};

/**
 * Helper function to get ordinal suffix for day numbers
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Utility function to check if write operations are currently permitted
 * Can be used in services or other parts of the application
 */
export const isWritePermitted = (): boolean => {
  return true;
};

/**
 * Get the next date when write operations will be permitted
 */
export const getNextWritePermissionDate = (): Date => {
  const today = new Date();
  const currentDay = today.getDate();
  
  if (currentDay < 15) {
    // Next 15th is this month
    return new Date(today.getFullYear(), today.getMonth(), 15);
  } else {
    // Next 15th is next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    return nextMonth;
  }
};
