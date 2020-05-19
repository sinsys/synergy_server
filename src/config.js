require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_KEY: process.env.ROYALE_API_KEY || 'fake',
  BASE_URL: 'https://proxy.royaleapi.dev/v1',
  DATABASE_URL: process.env.DATABASE_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL
}