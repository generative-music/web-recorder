import isSupported from './is-supported';

describe('isSupported', () => {
  it('should match whether MediaRecorder is available', () => {
    expect(isSupported).to.equal(Boolean(window.MediaRecorder));
  });
});
