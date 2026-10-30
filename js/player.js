/**
 * Intentional Music — Disguised YouTube Audio Engine
 * Features:
 *  - Distraction-free audio playback via hidden YouTube Iframe API
 *  - Exact 90% listen requirement tracking for video-game style completion
 *  - Album queue (plays album sequentially in intended track order)
 *  - Play/pause, seek, volume, like toggle
 */

import { storage } from './storage.js';

export class DisguisedPlayer {
  constructor({ onTrackChange, onSongCompleted, onProgressUpdate, onPlayStateChange }) {
    this.onTrackChange = onTrackChange || (() => {});
    this.onSongCompleted = onSongCompleted || (() => {});
    this.onProgressUpdate = onProgressUpdate || (() => {});
    this.onPlayStateChange = onPlayStateChange || (() => {});

    this.ytPlayer = null;
    this.isReady = false;
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentAlbum = null;
    this.queue = [];
    this.queueIndex = 0;

    // 90% tracking state
    this.hasCompletedCurrentSong = false;
    this.progressInterval = null;
    this.pollIntervalMs = 400;

    this.initYouTubeIFrame();
  }

  initYouTubeIFrame() {
    const checkYT = () => {
      if (window.YT && window.YT.Player) {
        this.createPlayer();
      } else {
        setTimeout(checkYT, 200);
      }
    };
    checkYT();
  }

  createPlayer() {
    try {
      this.ytPlayer = new window.YT.Player('youtube-iframe-target', {
        height: '200',
        width: '200',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (e) => {
            this.isReady = true;
            this.ytPlayer.setVolume(80);
          },
          onStateChange: (e) => this.handlePlayerStateChange(e),
          onError: (e) => {
            console.warn('YouTube Player error code:', e.data);
            // If search fails or blocked, fallback gracefully
          }
        }
      });
    } catch (e) {
      console.error('Error creating YouTube player:', e);
    }
  }

  handlePlayerStateChange(e) {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (e.data === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.startProgressTracking();
      this.onPlayStateChange(true);
    } else if (e.data === window.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      this.stopProgressTracking();
      this.onPlayStateChange(false);
    } else if (e.data === window.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.stopProgressTracking();
      this.onPlayStateChange(false);

      // Play next track in album queue if available
      this.playNext();
    }
  }

  /**
   * Play a track, optionally setting the album queue
   */
  playTrack(track, album = null, queueList = null) {
    if (!track) return;

    this.currentTrack = track;
    if (album) this.currentAlbum = album;
    if (queueList && queueList.length > 0) {
      this.queue = queueList;
      this.queueIndex = queueList.findIndex(t => t.id === track.id);
      if (this.queueIndex === -1) this.queueIndex = 0;
    }

    // Reset 90% tracking for the new song
    this.hasCompletedCurrentSong = storage.isSongCompleted(track.id);

    // Increment play attempt count
    storage.incrementPlayCount(track.id);

    this.onTrackChange(track, album);

    if (this.isReady && this.ytPlayer) {
      const query = track.youtubeSearchQuery || `${track.artist} - ${track.title} official audio`;
      // Load YouTube audio matching the track via search query list
      try {
        this.ytPlayer.loadPlaylist({
          listType: 'search',
          list: query,
          index: 0
        });
      } catch (err) {
        console.warn('Error queuing YouTube track:', err);
      }
    }
  }

  togglePlayPause() {
    if (!this.ytPlayer || !this.isReady) return;

    if (this.isPlaying) {
      this.ytPlayer.pauseVideo();
    } else {
      if (this.currentTrack) {
        this.ytPlayer.playVideo();
      } else if (this.queue.length > 0) {
        this.playTrack(this.queue[0], this.currentAlbum, this.queue);
      }
    }
  }

  playNext() {
    if (this.queue.length > 0 && this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      this.playTrack(this.queue[this.queueIndex], this.currentAlbum);
    }
  }

  playPrev() {
    if (this.queue.length > 0 && this.queueIndex > 0) {
      this.queueIndex--;
      this.playTrack(this.queue[this.queueIndex], this.currentAlbum);
    }
  }

  seekToRatio(ratio) {
    if (!this.ytPlayer || !this.isReady) return;
    try {
      const duration = this.ytPlayer.getDuration() || 0;
      if (duration > 0) {
        const seekSeconds = duration * ratio;
        this.ytPlayer.seekTo(seekSeconds, true);
      }
    } catch (e) {
      console.warn('Seek error:', e);
    }
  }

  setVolume(volumePercent) {
    if (!this.ytPlayer || !this.isReady) return;
    try {
      this.ytPlayer.setVolume(Math.max(0, Math.min(100, volumePercent)));
    } catch (e) {
      console.warn('Volume error:', e);
    }
  }

  /**
   * Monitor playback position and calculate the 90% completion rule
   */
  startProgressTracking() {
    this.stopProgressTracking();

    this.progressInterval = setInterval(() => {
      if (!this.ytPlayer || !this.isPlaying) return;

      try {
        const currentTime = this.ytPlayer.getCurrentTime() || 0;
        const duration = this.ytPlayer.getDuration() || 0;

        if (duration > 0) {
          const ratio = currentTime / duration;
          const pct = Math.min(100, Math.floor(ratio * 100));

          this.onProgressUpdate({
            currentTime,
            duration,
            ratio,
            percentage: pct,
            formattedCurrent: this.formatTime(currentTime),
            formattedDuration: this.formatTime(duration)
          });

          // ================= 90% RULE TRIGGER =================
          // When 90% of the song has been played, grant completion!
          if (ratio >= 0.90 && !this.hasCompletedCurrentSong) {
            this.hasCompletedCurrentSong = true;
            if (this.currentTrack) {
              storage.recordSongCompletion(this.currentTrack.id, duration);
              this.onSongCompleted(this.currentTrack, this.currentAlbum);
            }
          }
        }
      } catch (err) {
        console.warn('Progress tracking tick error:', err);
      }
    }, this.pollIntervalMs);
  }

  stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
