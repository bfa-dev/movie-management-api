export default {
  env: 'test',
  database: {
    url: process.env.TEST_DATABASE_URL,
    type: 'postgres',
    synchronize: false,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  },
};
