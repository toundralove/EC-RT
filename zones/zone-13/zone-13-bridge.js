export function mapAudioToVisual(audioState) {
  return {
    amplitude: audioState.amplitude,
    bass: audioState.bass,
    mids: audioState.mids,
    highs: audioState.highs,
    transient: audioState.transient
  };
}