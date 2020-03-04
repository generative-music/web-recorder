'use strict';

const config = {
  input: './src/record.js',
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
