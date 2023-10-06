import express from 'express';
import cors from 'cors';

import { auth, host, port } from './config.json';
import { db, testConnection } from './models';
import { ApiRouter } from './routes';
import { UserService, color, log } from './services';

(async () => {
  // Test database connection
  await testConnection();

  // Synchronize database tables
  await db.connection.sync({ alter: true, force: false });

  // Seed admin account if fresh install
  if (await UserService.isFreshInstall()) {
    await UserService.createUser(auth.admin, true);
  }

  // Initialize HTTP server
  const app = express();
  app.use(cors({
    allowedHeaders: [
      //'Accept',
      'Content-Type',
      //'Content-Length',
      'If-None-Match',
      'x-access-token',
      //'*',
    ],
    origin: true,
    credentials: true,
  }));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Expose-Headers', 'ETag');
    next();
  });

  // Initialize routes
  ApiRouter(app);

  // Start listening
  app.listen(port, host, () => {
    log(`Listening at ${color('variable', `http://${host}:${port}`)}`);
  });
})();