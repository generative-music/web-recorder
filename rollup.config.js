'use strict';

const config = {
  input: './src/index.js',
  output: [
    {
      format: 'esm',
      file: `./dist/web-recorder.esm.js`,
    },
    {
      format: 'cjs',
      file: `./dist/web-recorder.cjs.js`,
    },
  ],
  external: ['rxjs', 'rxjs/operators', 'tone'],
};

module.exports = config;
