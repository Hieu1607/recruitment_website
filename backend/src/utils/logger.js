/**
 * Logger Utility
 * Centralized logging utility for the application
 * Can use libraries like winston or morgan
 */

const logger = {
    info: (message) => {
        console.log(`[INFO] ${message}`);
    },
    error: (message) => {
        console.error(`[ERROR] ${message}`);
    },
    warn: (message) => {
        console.warn(`[WARN] ${message}`);
    },
};

module.exports = logger;

