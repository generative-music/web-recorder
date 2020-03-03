import Tone from 'tone';

const webRecorder = (
  piece,
  pieceConfig = {},
  recordingConfig = {
    lengthS: 0,
    fadeInS: 0,
    fadeOutS: 0,
  }
) => {
  Object.assign(pieceConfig, { audioContext: Tone.Context });
  if (Tone.context !== pieceConfig.audioContext) {
    Tone.setContext(pieceConfig);
  }
  const streamDestination = Tone.context.createMediaStreamDestination();
  const { lengthS } = recordingConfig;
  return piece(
    Object.assign({}, pieceConfig, {
      destination: streamDestination,
    })
  ).then(
    cleanup =>
      new Promise(resolve => {
        const recorder = new MediaRecorder(streamDestination.stream);
        const recordingChunks = [];
        recorder.addEventListener('dataavailable', event => {
          recordingChunks.push(event.data);
        });
        recorder.addEventListener('stop', () => {
          resolve(new Blob(recordingChunks));
        });
        Tone.Transport.scheduleOnce(() => {
          Tone.Transport.stop();
          recorder.stop();
          cleanup();
        }, lengthS);
        recorder.start();
        Tone.Transport.start();
        Tone.context.resume();
      })
  );
};

export default webRecorder;
