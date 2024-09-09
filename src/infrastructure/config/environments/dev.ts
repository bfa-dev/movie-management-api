export default {
  env: 'dev',
  database: {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    synchronize: false,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  },
};
