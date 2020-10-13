import * as Tone from 'tone';
import webRecorder from './record';

const noop = () => {
  /* do nothing */
};

const getNoop = () => noop;

describe('recorder', () => {
  it('should create the piece', () => {
    const mockSchedule = () => {
      mockSchedule.called = true;
      return noop;
    };
    const piece = () => {
      piece.called = true;
      return Promise.resolve([noop, mockSchedule]);
    };
    return new Promise(resolve =>
      webRecorder(piece)
        .subscribe(() => {
          expect(piece).to.have.property('called', true);
          expect(mockSchedule.called).to.be.true;
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
      return Promise.resolve([noop, getNoop]);
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
    const piece = () => Promise.resolve([noop, getNoop]);
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
  it('should call the end and deactivate functions', () => {
    const mockEnd = () => {
      mockEnd.called = true;
    };
    const mockSchedule = () => mockEnd;
    const mockDeactivate = () => {
      mockDeactivate.called = true;
    };
    const piece = () => Promise.resolve([mockDeactivate, mockSchedule]);
    return new Promise(resolve => {
      webRecorder(piece)
        .subscribe(() => {
          // nah
        })
        .add(() => {
          expect(mockEnd).to.have.property('called', true);
          expect(mockDeactivate).to.have.property('called', true);
          resolve();
        });
    });
  });
  it('should pass multiple blobs if timeslice < lengthS * 1000', () => {
    const piece = ({ destination }) => {
      const oscillator = new Tone.Oscillator().connect(destination);
      oscillator.start();
      return Promise.resolve([() => oscillator.dispose(), getNoop]);
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
  it('should pass Tone.context to the recorded piece', () => {
    const piece = ({ context }) => {
      expect(context).to.equal(Tone.context);
      piece.called = true;
      return Promise.resolve([noop, getNoop]);
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
