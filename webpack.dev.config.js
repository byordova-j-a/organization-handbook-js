import { merge } from 'webpack-merge';
import commonConfig from './webpack.common.config.js';

const config = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    port: 8080,
  },
});

export default config;
