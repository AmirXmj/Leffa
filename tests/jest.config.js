module.exports = {
    testEnvironment: 'node',
    testTimeout: 60000,
    verbose: true,
    reporters: [
        'default', ['jest-junit', {
            outputDirectory: './results',
            outputName: 'junit.xml',
        }],
    ],
    testMatch: [
        '**/*.test.js'
    ],
    setupFilesAfterEnv: ['./jest.setup.js'],
};