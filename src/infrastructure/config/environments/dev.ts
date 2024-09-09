export default {
  env: 'dev',
  database: {
    url: process.env.DEV_DATABASE_URL,
    type: 'postgres',
    synchronize: false,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  },
};
