import record from './record';
import isSupported from './is-supported';

export default Object.defineProperty(record, 'isSupported', {
  value: isSupported,
});
