// ============================================
// LOCAL SERVER ONLY
// ============================================

require('dotenv').config();

const app = require('./app');
const { testConnection, closePool } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Database connection failed');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      server.close();
      await closePool();
      process.exit(0);
    });

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
