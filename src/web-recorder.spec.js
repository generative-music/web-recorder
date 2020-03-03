/* eslint-env mocha */

import expect from 'chai/interface/expect';
import webRecorder from './web-recorder';

//eslint-disable-next-line no-empty-function
const noop = () => {};

describe('webRecorder', () => {
  it('should create the piece', () => {
    const piece = () => {
      piece.called = true;
      return Promise.resolve(noop);
    };
    return webRecorder(piece).then(() => {
      expect(piece).to.have.property('called', true);
    });
  });
  it('should pass pieceConfig to the piece', () => {
    const pieceConfig = {
      test1: true,
      test2: 'hello',
    };
    const piece = config => {
      Object.keys(pieceConfig).forEach(key => {
        expect(config).to.have.property(key, pieceConfig[key]);
      });
      return Promise.resolve(noop);
    };
    return webRecorder(piece, pieceConfig);
  });
  it('should return a promise that resolves with an audioBuffer of the recording', () => {
    const piece = () => Promise.resolve(noop);
    return webRecorder(piece).then(recording =>
      expect(recording).to.be.an.instanceof(Blob)
    );
  });
  it('should call the cleanup function', () => {
    const cleanup = () => {
      cleanup.called = true;
    };
    const piece = () => Promise.resolve(cleanup);
    return webRecorder(piece).then(() => {
      expect(cleanup).to.have.property('called', true);
    });
  });
});
