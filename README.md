# @generative-music/web-recorder

A library for recording web audio systems.

## Usage

This package exports a function which accepts a [`Piece`] and optionally a `pieceConfig` object, a `recordingConfig` object, and an array of [`MediaStreamTrack`] objects.

### `record()`

The default export of this package is a function which creates a recording of a given `Piece` and returns an [RxJS Subscribable](https://rxjs-dev.firebaseapp.com/api/index/interface/Subscribable) object that produces one or more [`Blob`] objects containing the recording data.

#### Syntax

```javascript
record(piece, pieceConfig, recordingConfig, videoTracks).subscribe(blob => {
  // do something with the blob(s)
});
```

##### Parameters

- **piece** - The [`Piece`] to record.
- **pieceConfig** _(Optional)_ - An `object` passed as an argument to the `Piece` function. Note that any `audioContext` and `destination` properties defined on this object are ignored and overridden by the `record` function.
- **recordingConfig** _(Optional)_ - An `object` with the following properties:
  - **lengthS** _(Optional)_ - A `number` specifying the length, in seconds, of the recording. This can be set to `Infinity` to record indefinitely. The default value is `0`.
  - **fadeInS** _(Optional)_ - A `number` specifying the length, in seconds, to fade in the audio at the beginning of the recording. The default value is `0`.
  - **fadeOutS** _(Optional)_ - A `number` specifying the length, in seconds, to fade out the audio at the end of the recording. The default value is `0`.
  - **timeslice** _(Optional)_ - A `number` specifying the length, in milliseconds, to record into each `Blob`. See the `timeslice` parameter of [`MediaRecorder.start()`](https://developer.mozilla.org/docs/Web/API/MediaRecorder/start).
  - **mimeType** _(Optional)_ - A MIME type to use for the recording. Acceptable values vary per browser. The default value is `'audio/wav'`.
- **videoTracks** _(Optional)_ - An array of [`MediaStreamTrack`] objects to be mixed with the audio and recorded.

##### Return value

An [RxJS `Subscribable`](https://rxjs-dev.firebaseapp.com/api/index/interface/Subscribable) object which produces one or more [`Blob`] objects that contain the recording data. If `recordingConfig.timeslice` was defined, the recording will be split into separate `Blob` objects of the specified length (see above). Otherwise, the entire recording will be returned as a single `Blob`. Each subscription yields a separate recording.

### `checkSupport()`

`checkSupport` is a named export from this package which can be used to determine whether recording is supported by the environment.

#### Syntax

```javascript
checkSupport.then(isSupported => {
  // do something with the result
});
```

##### Return Value

A `Promise` which resolves to `true` if recording is supported by the environment or `false` otherwise.

#### Example

```javascript
if (record.isSupported) {
  // call record()
} else {
  // record is not supported; exit
}
```

## Examples

### Fixed-length recording

This example creates a 10 minute recording with a 30 second fade out of a [`Piece`] defined in the file `'./some-piece.js'`.

```javascript
import record from '@generative-music/web-recorder';
import piece from './some-piece';

record(piece, {}, { lengthS: 10 * 60, fadeOutS: 30 }).subscribe(blob => {
  // got a Blob with the entire recording
});
```

### Indefinite recording

This example creates indefinitely records a [`Piece`] defined in the file `'./some-piece.js'` in 1-second chunks. It also passes some extra options to the [`Piece`].

```javascript
import record from '@generative-music/web-recorder';
import piece from './some-piece';

record(piece, {}, { lengthS: Infinity, timeslice: 1000 }).subscribe(blob => {
  // got a Blob with 1 second of recorded audio
});
```

### Checking for support

This example checks whether `record` is supported and logs the result.

```javascript
import record, { checkSupport } from '@generative-music/web-recorder';
import piece from './some-piece';

checkSupport().then(isSupported => {
  if (isSupported) {
    console.log('Recording is supported; okay to call record()');
  } else {
    console.log('Recording is NOT supported');
  }
});
```

### Custom piece configuration

This example passes in a custom `pieceConfig` object which will be passed to `piece` defined upon recording.

```javascript
import record from '@generative-music/web-recorder';
import piece from './some-piece';

const pieceConfig = {
  somePieceOption: true,
};

record(piece, pieceConfig, { lengthS: 20 }).subscribe(blob => {
  // pieceConfig was passed to piece
});
```

[`piece`]: https://github.com/generative-music/piece-interface
[`mediastreamtrack`]: https://developer.mozilla.org/docs/Web/API/MediaStreamTrack
[`blob`]: https://developer.mozilla.org/docs/Web/API/Blob
