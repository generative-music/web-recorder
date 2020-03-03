import Tone from 'tone';
import { fromEvent, from } from 'rxjs';
import { switchMap, finalize, takeUntil, map } from 'rxjs/operators';

const webRecorder = (
  piece,
  pieceConfig = {},
  recordingConfig = {
    lengthS: 0,
    fadeInS: 0,
    fadeOutS: 0,
  },
  videoTracks = []
) => {
  Object.assign(pieceConfig, { audioContext: Tone.Context });
  if (Tone.context !== pieceConfig.audioContext) {
    Tone.setContext(pieceConfig);
  }
  const streamDestination = Tone.context.createMediaStreamDestination();
  videoTracks.forEach(videoTrack => {
    streamDestination.stream.addTrack(videoTrack);
  });
  const masterVol = new Tone.Volume().connect(streamDestination);
  const { lengthS } = recordingConfig;
  const recorder = new MediaRecorder(streamDestination.stream);
  let cleanUp;
  return from(
    piece(
      Object.assign({}, pieceConfig, {
        destination: masterVol,
      })
    )
  ).pipe(
    switchMap(cleanUpFn => {
      cleanUp = cleanUpFn;
      if (lengthS < Infinity) {
        Tone.Transport.scheduleOnce(() => {
          recorder.stop();
        }, lengthS);
      }
      recorder.start(recordingConfig.timeslice);
      Tone.Transport.start();
      Tone.context.resume();
      return fromEvent(recorder, 'dataavailable').pipe(
        map(({ data }) => data),
        takeUntil(fromEvent(recorder, 'stop'))
      );
    }),
    finalize(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (cleanUp) {
        cleanUp();
      }
      masterVol.dispose();
      streamDestination.dispose();
    })
  );
};

export default webRecorder;
