import { useEffect } from 'react';
import { CoinTrack } from '../models';

interface MediaSessionOptions {
  track: CoinTrack | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const useMediaSession = ({
  track,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious
}: MediaSessionOptions) => {
  useEffect(() => {
    if (!('mediaSession' in navigator) || !track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.genre,
      artwork: [
        {
          src: track.artworkUrl,
          sizes: '512x512',
          type: 'image/jpeg'
        }
      ]
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    const actionHandlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', onPlay],
      ['pause', onPause],
      ['nexttrack', onNext],
      ['previoustrack', onPrevious]
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`Media session action "${action}" not supported:`, error);
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    };
  }, [track, isPlaying, onPlay, onPause, onNext, onPrevious]);
};