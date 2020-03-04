# @generative-music/web-recorder

A library for recording web audio systems.

## Usage

This package exports a function which accepts a [`Piece`](https://github.com/generative-music/piece-interface) and optionally a `pieceConfig` object, a `recordingConfig` object, and an array of [`MediaStreamTrack`](https://developer.mozilla.org/docs/Web/API/MediaStreamTrack) objects.

### `record()`

A function which creates a recording of a given `Piece` and returns an [RxJS Subscribable](https://rxjs-dev.firebaseapp.com/api/index/interface/Subscribable) object that produces one or more [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) objects containing the recording data.

#### Syntax

```javascript
record(piece, pieceConfig, recordingConfig, videoTracks).subscribe(blob => {
  // do something with the blob(s)
});
```

##### Parameters

- **piece** - The [`Piece`](https://github.com/generative-music/piece-interface) to record.
- **pieceConfig** _(Optional)_ - An `object` passed as an argument to the `Piece` function. Note that any `audioContext` and `destination` properties defined on this object are ignored and overridden by the `record` function.
- **recordingConfig** _(Optional)_ - An `object` with the following properties:
  - **lengthS** _(Optional)_ - A `number` specifying the length, in seconds, of the recording. This can be set to `Infinity` to record indefinitely. The default value is `0`.
  - **fadeInS** _(Optional)_ - A `number` specifying the length, in seconds, to fade in the audio at the beginning of the recording. The default value is `0`.
  - **fadeOutS** _(Optional)_ - A `number` specifying the length, in seconds, to fade out the audio at the end of the recording. The default value is `0`.
  - **timeslice** _(Optional)_ - A `number` specifying the length, in milliseconds, to record into each `Blob`. See the `timeslice` parameter of [`MediaRecorder.start()`](https://developer.mozilla.org/docs/Web/API/MediaRecorder/start).
- **videoTracks** _(Optional)_ - An array of [`MediaStreamTrack`](https://developer.mozilla.org/docs/Web/API/MediaStreamTrack) objects to be mixed with the audio and recorded.

##### Return value

An [RxJS `Subscribable`](https://rxjs-dev.firebaseapp.com/api/index/interface/Subscribable) object which produces one or more [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) objects that contain the recording data. If `recordingConfig.timeslice` was defined, the recording will be split into separate `Blob` objects of the specified length (see above). Otherwise, the entire recording will be returned as a single `Blob`. Each subscription yields a separate recording.

## Examples

### Fixed-length recording

This example creates a 10 minute recording with a 30 second fade out of a `Piece` defined in the file `'./some-piece.js'`.

```javascript
import record from '@generative-music/web-recorder';
import piece from './some-piece';

record(piece, {}, { lengthS: 10 * 60, fadeOutS: 30 }).subscribe(blob => {
  // got a Blob with the entire recording
});
```

### Indefinite recording

This example creates indefinitely records a `Piece` defined in the file `'./some-piece.js'` in 1-second chunks. It also passes some extra options to the `Piece`.

```javascript
import record from '@generative-music/web-recorder';
import piece from './some-piece';

record(
  piece,
  { somePieceConfigProperty: true },
  { lengthS: Infinity, timeslice: 1000 }
).subscribe(blob => {
  // got a Blob with 1 second of recorded audio
});
```
