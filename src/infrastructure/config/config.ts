const appName = process.env.APP_NAME || 'movie-management-system';
const appVersion = process.env.APP_VERSION || '1.0.0';
const env = process.env.NODE_ENV || 'dev';

export default () => ({
  app: {
    name: appName,
    version: appVersion,
    env: env,
  },
  database: {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    synchronize: false, // Set to false for all environments by default
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME,
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || 'API Documentation',
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for the application',
    version: process.env.SWAGGER_VERSION || '1.0',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  timeout: 10000,
});
