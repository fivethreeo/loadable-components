/** @type {import('jest').Config} */
const config = {
    "testEnvironment": "jest-environment-selenium-webdriver",
    "testEnvironmentOptions": {
      "browser": "firefox"
    },
    transform: {
      '\\.[jt]sx?$': 'babel-jest',
    },
  };
  
  module.exports = config;