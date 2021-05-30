import { isSupported } from 'extendable-media-recorder';
import checkSupport from './check-support';

describe('checkSupport', () => {
  it("should resolve with the same value as extendable-media-recorder's isSupported", () =>
    Promise.all([checkSupport(), isSupported()]).then(results =>
      expect(results.every(val => val)).to.equal(true)
    ));
});
