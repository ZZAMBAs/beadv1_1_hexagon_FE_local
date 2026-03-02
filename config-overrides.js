const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
    // 1. fallback 설정 (Node.js 코어 모듈 대체)
    config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer/'),
        path: require.resolve('path-browserify'),
        vm: false,
        fs: false, // 파일 시스템은 브라우저에서 사용할 수 없으므로 false
    };

    // 2. 확장자 및 모듈 해결 설정 강화
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];

    // 3. Webpack 5에서 필요한 전역 변수 설정 (Plugins)
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser', // process 전역 변수 설정
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    // 4. Node 설정 제거 (일부 라이브러리 충돌 방지)
    config.resolve.alias = {
        // 기존 alias가 있다면 유지하고, 필요하면 추가
    };
    config.module.rules.unshift({
        test: /node_modules[\\/]axios[\\/]/, // axios 내에서 발생하는 문제 해결 시도
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      });
    
    return config;
};
