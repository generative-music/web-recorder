import Tone from 'tone';
import webRecorder from './record';

//eslint-disable-next-line no-empty-function
const noop = () => {};

describe('recorder', () => {
  it('should create the piece', () => {
    const piece = () => {
      piece.called = true;
      return Promise.resolve(noop);
    };
    return new Promise(resolve =>
      webRecorder(piece)
        .subscribe(() => {
          expect(piece).to.have.property('called', true);
        })
        .add(() => {
          resolve();
        })
    );
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
    return new Promise(resolve =>
      webRecorder(piece, pieceConfig)
        .subscribe(() => {
          // nah
        })
        .add(() => {
          resolve();
        })
    );
  });
  it('should return a promise that resolves with a Blob of the recording', () => {
    const piece = () => Promise.resolve(noop);
    return new Promise(resolve =>
      webRecorder(piece)
        .subscribe(recording => {
          expect(recording).to.be.an.instanceof(Blob);
        })
        .add(() => {
          resolve();
        })
    );
  });
  it('should call the cleanUp function', () => {
    const cleanUp = () => {
      cleanUp.called = true;
    };
    const piece = () => Promise.resolve(cleanUp);
    return new Promise(resolve => {
      webRecorder(piece)
        .subscribe(() => {
          // nah
        })
        .add(() => {
          expect(cleanUp).to.have.property('called', true);
          resolve();
        });
    });
  });
  it('should pass multiple blobs if timeslice < lengthS * 1000', () => {
    const piece = ({ destination }) => {
      const oscillator = new Tone.Oscillator().connect(destination);
      oscillator.start();
      return Promise.resolve(() => oscillator.dispose());
    };
    return new Promise(resolve => {
      const blobs = [];
      webRecorder(piece, {}, { lengthS: 1, timeslice: 100 })
        .subscribe(blob => {
          blobs.push(blob);
        })
        .add(() => {
          expect(blobs.length).to.be.greaterThan(1);
          resolve();
        });
    });
  });
  it('should change pass Tone.context to the recorded piece', () => {
    const piece = ({ audioContext }) => {
      expect(audioContext).to.equal(Tone.context);
      piece.called = true;
      return Promise.resolve(noop);
    };
    return new Promise(resolve =>
      webRecorder(piece)
        .subscribe(() => {
          expect(piece).to.have.property('called', true);
        })
        .add(() => {
          resolve();
        })
    );
  });
});
