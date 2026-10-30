/**
 * Intentional Music — Real YouTube Audio/Video Engine
 * Uses the official YouTube IFrame Embed Player directly:
 *  - Plays the 100% FULL track directly from YouTube (no 30s preview limit)
 *  - Visible, docked sleek mini-player in the bottom right (satisfies YouTube ToS and avoids Error 150 blocks)
 *  - Real-time 90% Duration Completion tracking
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

    this.hasCompletedCurrentSong = false;
    this.progressInterval = null;
    this.pollIntervalMs = 300;

    this.initYouTube();
  }

  initYouTube() {
    // If API ready already
    if (window.YT && window.YT.Player) {
      this.createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
      // Load script if not present
      if (!document.getElementById('yt-iframe-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
  }

  createPlayer() {
    try {
      this.ytPlayer = new window.YT.Player('youtube-player-frame', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1
        },
        events: {
          onReady: () => {
            this.isReady = true;
          },
          onStateChange: (e) => this.handleStateChange(e),
          onError: (e) => {
            console.warn('YouTube playback error code:', e.data);
          }
        }
      });
    } catch (e) {
      console.error('Error instantiating YouTube player:', e);
    }
  }

  handleStateChange(e) {
    // 1 = playing, 2 = paused, 0 = ended
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
      this.playNext();
    }
  }

  /**
   * Search and play the exact YouTube video ID
   */
  async playTrack(track, album = null, queueList = null) {
    if (!track) return;

    this.currentTrack = track;
    if (album) this.currentAlbum = album;
    if (queueList && queueList.length > 0) {
      this.queue = queueList;
      this.queueIndex = queueList.findIndex(t => t.id === track.id);
      if (this.queueIndex === -1) this.queueIndex = 0;
    }

    this.hasCompletedCurrentSong = storage.isSongCompleted(track.id);
    storage.incrementPlayCount(track.id);
    this.onTrackChange(track, album);

    // Show docked player iframe container
    const frameContainer = document.getElementById('youtube-player-container');
    if (frameContainer) {
      frameContainer.classList.remove('hidden');
    }

    // Resolve video ID
    const query = `${track.artist} - ${track.title} audio`;
    const videoId = await this.resolveVideoId(query);

    if (videoId && this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      try {
        this.ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
        this.ytPlayer.playVideo();
      } catch (err) {
        console.warn('YouTube load error:', err);
      }
    } else {
      // Fallback: update iframe src directly if player object not ready
      const iframe = document.getElementById('youtube-player-frame');
      if (iframe && videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      }
    }
  }

  async resolveVideoId(query) {
    // 1. Direct High-Quality Known Database
    const directMap = {
      'pink floyd speak to me': '4q9j3vO6k_k',
      'pink floyd breathe': 'mrojrDCI02o',
      'pink floyd on the run': '4c_X3k_V03U',
      'pink floyd time': 'rL3AgkwbYgo',
      'pink floyd the great gig in the sky': 'cWGE7bWlW7Y',
      'pink floyd money': '-0kcet4aPpQ',
      'pink floyd us and them': 'nlJXZ515gT8',
      'pink floyd any colour you like': '2Zhhz8qLd9g',
      'pink floyd brain damage': 'DVQ3-Xe_fzE',
      'pink floyd eclipse': 'Ilry_Y3bL78',
      'pink floyd wish you were here': 'IXdNnw99-Ic',
      'avenged sevenfold critical acclaim': '2UaI3o2P968',
      'avenged sevenfold afterlife': 'd5p_pQ-pW5g',
      'avenged sevenfold bat country': 'IHS3qJdxefY',
      'avenged sevenfold almost easy': 'Fi_GN1pHCVc',
      'avenged sevenfold a little piece of heaven': 'VurhzANQ_B0',
      'daft punk one more time': 'FGBhQbmPwH8',
      'daft punk aerodynamic': 'L93-7vRfxNo',
      'daft punk digital love': 'FxzBvqY5PP0',
      'daft punk harder, better, faster, stronger': 'gAjR4_CbPpQ',
      'daft punk get lucky': '5NV6Rdv1a3w',
      'radiohead paranoid android': 'fHiGbolFFGw',
      'radiohead karma police': '1uYWYWPc9HU',
      'radiohead no surprises': 'u5CVsCnxyXg',
      'kendrick lamar money trees': 'smqhSl0u_Qk',
      'miles davis so what': 'zqNTltOGh5c',
      'queen bohemian rhapsody': 'fJ9rUzIMcZQ',
      'nirvana smells like teen spirit': 'hTWKbfoikeg'
    };

    const clean = query.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    for (const [key, id] of Object.entries(directMap)) {
      if (clean.includes(key)) return id;
    }

    // 2. Query Invidious API
    const instances = [
      'https://inv.tux.pizza',
      'https://invidious.nerdvpn.de',
      'https://vid.puffyan.us'
    ];

    for (const inst of instances) {
      try {
        const url = `${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].videoId) {
            return data[0].videoId;
          }
        }
      } catch (_) {}
    }

    // 3. Fallback: Search via allorigins CORS proxy
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.youtube.com/results?search_query=' + encodeURIComponent(query))}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        const match = data.contents.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (_) {}

    return '4q9j3vO6k_k'; // fallback
  }

  togglePlayPause() {
    if (!this.ytPlayer || !this.isReady) return;
    try {
      if (this.isPlaying) {
        this.ytPlayer.pauseVideo();
      } else {
        if (this.currentTrack) {
          this.ytPlayer.playVideo();
        } else if (this.queue.length > 0) {
          this.playTrack(this.queue[0], this.currentAlbum, this.queue);
        }
      }
    } catch (e) {
      console.warn('Play toggle error:', e);
    }
  }

  playNext() {
    if (this.queue.length > 0 && this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      this.playTrack(this.queue[this.queueIndex], this.currentAlbum, this.queue);
    }
  }

  playPrev() {
    if (this.queue.length > 0 && this.queueIndex > 0) {
      this.queueIndex--;
      this.playTrack(this.queue[this.queueIndex], this.currentAlbum, this.queue);
    }
  }

  seekToRatio(ratio) {
    if (!this.ytPlayer || !this.isReady) return;
    try {
      const dur = this.ytPlayer.getDuration() || 0;
      if (dur > 0) {
        this.ytPlayer.seekTo(dur * ratio, true);
      }
    } catch (_) {}
  }

  setVolume(volumePercent) {
    if (!this.ytPlayer || !this.isReady) return;
    try {
      this.ytPlayer.setVolume(Math.max(0, Math.min(100, volumePercent)));
    } catch (_) {}
  }

  startProgressTracking() {
    this.stopProgressTracking();

    this.progressInterval = setInterval(() => {
      if (!this.ytPlayer || !this.isReady) return;
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

          // 90% Achievement Tracker
          if (ratio >= 0.90 && !this.hasCompletedCurrentSong) {
            this.hasCompletedCurrentSong = true;
            if (this.currentTrack) {
              storage.recordSongCompletion(this.currentTrack.id, duration);
              this.onSongCompleted(this.currentTrack, this.currentAlbum);
            }
          }
        }
      } catch (_) {}
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

  getYoutubeMusicUrl() {
    if (!this.currentTrack) return 'https://music.youtube.com';
    const query = `${this.currentTrack.artist} ${this.currentTrack.title}`;
    return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
  }
}
