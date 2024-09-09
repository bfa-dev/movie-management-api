/* eslint-disable @typescript-eslint/no-require-imports */
import * as R from 'ramda';

import commonConfig from './common.config';

export default () => {
  const env = process.env.NODE_ENV || 'dev';
  const envSpecificConfig = require(`./environments/${env}`).default;
  const config = R.mergeDeepRight(commonConfig(), envSpecificConfig);
  return config;
};
