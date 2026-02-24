module.exports = {
  testEnvironment: 'jsdom', // node | jsdom
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  snapshotSerializers: [],
  setupFiles: ['./test/setup.js']
}
