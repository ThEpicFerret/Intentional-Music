/**
 * Intentional Music — YouTube Video ID Resolver & Audio Engine
 * Fixes:
 *  1. Resolves real YouTube videoIds dynamically (bypassing deprecated listType=search)
 *  2. Fixes Chrome offscreen iframe throttling (1px on-screen active container)
 *  3. Instant fallback audio preview support for zero-delay playback
 *  4. 90% listen requirement calculation
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

    // Fallback HTML5 audio element for instant playback while YouTube buffers
    this.html5Audio = new Audio();
    this.html5Audio.volume = 0.8;
    this.activeSource = 'none'; // 'youtube' | 'html5'

    // 90% tracking state
    this.hasCompletedCurrentSong = false;
    this.progressInterval = null;
    this.pollIntervalMs = 400;

    this.initYouTubeIFrame();
    this.initHTML5AudioEvents();
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
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (e) => {
            this.isReady = true;
            try { this.ytPlayer.setVolume(80); } catch (_) {}
          },
          onStateChange: (e) => this.handlePlayerStateChange(e),
          onError: (e) => {
            console.warn('YouTube Player error:', e.data);
            this.fallbackToHTML5();
          }
        }
      });
    } catch (e) {
      console.error('Error creating YouTube player:', e);
    }
  }

  initHTML5AudioEvents() {
    this.html5Audio.addEventListener('playing', () => {
      if (this.activeSource === 'html5') {
        this.isPlaying = true;
        this.startProgressTracking();
        this.onPlayStateChange(true);
      }
    });

    this.html5Audio.addEventListener('pause', () => {
      if (this.activeSource === 'html5') {
        this.isPlaying = false;
        this.stopProgressTracking();
        this.onPlayStateChange(false);
      }
    });

    this.html5Audio.addEventListener('ended', () => {
      if (this.activeSource === 'html5') {
        this.isPlaying = false;
        this.stopProgressTracking();
        this.onPlayStateChange(false);
        this.playNext();
      }
    });
  }

  handlePlayerStateChange(e) {
    if (e.data === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.activeSource = 'youtube';
      // Stop HTML5 preview if it was playing
      this.html5Audio.pause();
      this.startProgressTracking();
      this.onPlayStateChange(true);
    } else if (e.data === window.YT.PlayerState.PAUSED) {
      if (this.activeSource === 'youtube') {
        this.isPlaying = false;
        this.stopProgressTracking();
        this.onPlayStateChange(false);
      }
    } else if (e.data === window.YT.PlayerState.ENDED) {
      if (this.activeSource === 'youtube') {
        this.isPlaying = false;
        this.stopProgressTracking();
        this.onPlayStateChange(false);
        this.playNext();
      }
    }
  }

  /**
   * Resolve a real YouTube Video ID from search queries
   */
  async resolveYouTubeVideoId(query) {
    // 1. Check known high-priority mappings
    const known = {
      'Pink Floyd - Speak to Me': '4q9j3vO6k_k',
      'Pink Floyd - Breathe': 'mrojrDCI02o',
      'Pink Floyd - Time': 'rL3AgkwbYgo',
      'Pink Floyd - Money': '-0kcet4aPpQ',
      'Pink Floyd - Wish You Were Here': 'IXdNnw99-Ic',
      'Avenged Sevenfold - Critical Acclaim': '2UaI3o2P968',
      'Avenged Sevenfold - Afterlife': 'd5p_pQ-pW5g',
      'Avenged Sevenfold - Bat Country': 'IHS3qJdxefY',
      'Daft Punk - One More Time': 'FGBhQbmPwH8',
      'Daft Punk - Harder, Better, Faster, Stronger': 'gAjR4_CbPpQ',
      'Daft Punk - Get Lucky': '5NV6Rdv1a3w',
      'Radiohead - Paranoid Android': 'fHiGbolFFGw',
      'Radiohead - Karma Police': '1uYWYWPc9HU',
      'Kendrick Lamar - Money Trees': 'smqhSl0u_Qk',
      'Miles Davis - So What': 'zqNTltOGh5c',
      'Queen - Bohemian Rhapsody': 'fJ9rUzIMcZQ',
      'Nirvana - Smells Like Teen Spirit': 'hTWKbfoikeg'
    };

    for (const [key, val] of Object.entries(known)) {
      if (query.toLowerCase().includes(key.toLowerCase())) {
        return val;
      }
    }

    // 2. Fetch from Invidious API
    const instances = [
      'https://invidious.nerdvpn.de',
      'https://inv.tux.pizza',
      'https://vid.puffyan.us',
      'https://invidious.no-logs.com'
    ];

    for (const inst of instances) {
      try {
        const url = `${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].videoId) {
            return data[0].videoId;
          }
        }
      } catch (_) {
        // Try next instance
      }
    }

    // 3. Fallback: Query YouTube Search through CORS Proxy
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

    return null;
  }

  /**
   * Main Play Track Function
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

    // 1. Immediate Audio Response: Start preview if available to prevent silence
    if (track.previewUrl) {
      try {
        this.html5Audio.src = track.previewUrl;
        this.html5Audio.currentTime = 0;
        this.html5Audio.play().catch(() => {});
        this.activeSource = 'html5';
        this.isPlaying = true;
        this.startProgressTracking();
        this.onPlayStateChange(true);
      } catch (_) {}
    }

    // 2. Resolve YouTube Video ID for full continuous audio
    const query = track.youtubeSearchQuery || `${track.artist} - ${track.title} official audio`;
    const videoId = await this.resolveYouTubeVideoId(query);

    if (videoId && this.ytPlayer && this.isReady) {
      try {
        this.ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
        this.ytPlayer.playVideo();
      } catch (err) {
        console.warn('YouTube loadVideoById error:', err);
      }
    }
  }

  fallbackToHTML5() {
    if (this.currentTrack?.previewUrl) {
      this.activeSource = 'html5';
      this.html5Audio.src = this.currentTrack.previewUrl;
      this.html5Audio.play().catch(() => {});
    }
  }

  togglePlayPause() {
    if (this.activeSource === 'html5') {
      if (this.isPlaying) {
        this.html5Audio.pause();
      } else {
        this.html5Audio.play();
      }
      return;
    }

    if (this.ytPlayer && this.isReady) {
      if (this.isPlaying) {
        this.ytPlayer.pauseVideo();
      } else {
        if (this.currentTrack) {
          this.ytPlayer.playVideo();
        } else if (this.queue.length > 0) {
          this.playTrack(this.queue[0], this.currentAlbum, this.queue);
        }
      }
    } else if (this.currentTrack?.previewUrl) {
      this.fallbackToHTML5();
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
    if (this.activeSource === 'html5') {
      const dur = this.html5Audio.duration || 0;
      if (dur > 0) this.html5Audio.currentTime = dur * ratio;
      return;
    }

    if (this.ytPlayer && this.isReady) {
      try {
        const duration = this.ytPlayer.getDuration() || 0;
        if (duration > 0) {
          this.ytPlayer.seekTo(duration * ratio, true);
        }
      } catch (_) {}
    }
  }

  setVolume(volumePercent) {
    const vol = Math.max(0, Math.min(100, volumePercent));
    this.html5Audio.volume = vol / 100;

    if (this.ytPlayer && this.isReady) {
      try {
        this.ytPlayer.setVolume(vol);
      } catch (_) {}
    }
  }

  startProgressTracking() {
    this.stopProgressTracking();

    this.progressInterval = setInterval(() => {
      let currentTime = 0;
      let duration = 0;

      if (this.activeSource === 'html5') {
        currentTime = this.html5Audio.currentTime || 0;
        duration = this.html5Audio.duration || 0;
      } else if (this.ytPlayer && this.isReady) {
        try {
          currentTime = this.ytPlayer.getCurrentTime() || 0;
          duration = this.ytPlayer.getDuration() || 0;
        } catch (_) {}
      }

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

        // 90% listen achievement trigger
        if (ratio >= 0.90 && !this.hasCompletedCurrentSong) {
          this.hasCompletedCurrentSong = true;
          if (this.currentTrack) {
            storage.recordSongCompletion(this.currentTrack.id, duration);
            this.onSongCompleted(this.currentTrack, this.currentAlbum);
          }
        }
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
