// Extend Jest's default timeout to accommodate for longer running Puppeteer tests
jest.setTimeout(60000);

// Global error handling setup
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // This will help detect unhandled promise rejections during tests
});

// Console log formatting for better test output
const originalConsoleLog = console.log;
console.log = function(...args) {
    originalConsoleLog('\x1b[36m%s\x1b[0m', '[TEST]', ...args);
};