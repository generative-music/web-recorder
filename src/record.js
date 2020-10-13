import * as Tone from 'tone';
import { fromEvent, from } from 'rxjs';
import { switchMap, finalize, takeUntil, map } from 'rxjs/operators';

const record = (
  activate,
  pieceConfig = {},
  recordingConfig = {
    lengthS: 0,
    fadeInS: 0,
    fadeOutS: 0,
  },
  videoTracks = []
) => {
  const { lengthS, fadeInS, fadeOutS, timeslice } = recordingConfig;
  const streamDestination = Tone.context.createMediaStreamDestination();
  videoTracks.forEach(videoTrack => {
    streamDestination.stream.addTrack(videoTrack);
  });
  const masterGain = new Tone.Gain(fadeInS ? 0 : 1).connect(streamDestination);
  const recorder = new MediaRecorder(streamDestination.stream);
  const cleanUpFns = [];
  return from(
    activate(
      Object.assign(pieceConfig, {
        context: Tone.context,
        destination: masterGain,
      })
    )
  ).pipe(
    switchMap(([deactivate, schedule]) => {
      const end = schedule();
      cleanUpFns.push(end);
      cleanUpFns.push(deactivate);
      if (fadeInS) {
        masterGain.gain.setValueAtTime(0, Tone.context.currentTime);
        masterGain.gain.linearRampToValueAtTime(
          1,
          Tone.context.currentTime + fadeInS
        );
      }
      if (fadeOutS) {
        const fadeOutStartTime = Math.max(lengthS - fadeOutS, 0);
        Tone.Transport.scheduleOnce(time => {
          masterGain.gain.cancelScheduledValues(time);
          masterGain.gain.setValueAtTime(masterGain.gain.value, time);
          masterGain.gain.linearRampToValueAtTime(0, time + fadeOutS);
        }, fadeOutStartTime);
      }
      if (lengthS < Infinity) {
        Tone.Transport.scheduleOnce(() => {
          recorder.stop();
        }, lengthS);
      }
      recorder.start(timeslice);
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
      if (cleanUpFns.length > 0) {
        cleanUpFns.splice(0, cleanUpFns.length).forEach(fn => fn());
      }
      masterGain.dispose();
    })
  );
};

export default record;
