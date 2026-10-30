/**
 * Intentional Music — Storage & Preferences Manager
 * Supports:
 *  - Local-first storage (100% private)
 *  - Separate favorites for Songs, Albums, and Bands
 *  - Hidden/Removed bands list
 *  - Google/YouTube account profile
 */

const STORAGE_KEY = 'intentional_music_vault_v3';

class StorageManager {
  constructor() {
    this.data = this.loadLocal();
    this.currentUser = this.data.userProfile || null;
  }

  loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          customBands: parsed.customBands || [],
          hiddenBands: parsed.hiddenBands || {}, // bandId -> true
          trackProgress: parsed.trackProgress || {},
          favoriteSongs: parsed.favoriteSongs || {},
          favoriteAlbums: parsed.favoriteAlbums || {},
          favoriteBands: parsed.favoriteBands || {},
          userProfile: parsed.userProfile || null
        };
      }
    } catch (e) {
      console.warn('Failed to parse local storage, resetting:', e);
    }
    return {
      customBands: [],
      hiddenBands: {},
      trackProgress: {},
      favoriteSongs: {},
      favoriteAlbums: {},
      favoriteBands: {},
      userProfile: null
    };
  }

  saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // --- Track Completion & 90% Rule ---
  isSongCompleted(trackId) {
    return !!(this.data.trackProgress[trackId]?.completed);
  }

  getSongPlayCount(trackId) {
    return this.data.trackProgress[trackId]?.playCount || 0;
  }

  recordSongCompletion(trackId, duration = 0) {
    if (!this.data.trackProgress[trackId]) {
      this.data.trackProgress[trackId] = { completed: true, playCount: 1, duration, lastPlayed: Date.now() };
    } else {
      this.data.trackProgress[trackId].completed = true;
      this.data.trackProgress[trackId].playCount = (this.data.trackProgress[trackId].playCount || 0) + 1;
      this.data.trackProgress[trackId].lastPlayed = Date.now();
    }
    this.saveLocal();
  }

  incrementPlayCount(trackId) {
    if (!this.data.trackProgress[trackId]) {
      this.data.trackProgress[trackId] = { completed: false, playCount: 1, lastPlayed: Date.now() };
    } else {
      this.data.trackProgress[trackId].playCount = (this.data.trackProgress[trackId].playCount || 0) + 1;
      this.data.trackProgress[trackId].lastPlayed = Date.now();
    }
    this.saveLocal();
  }

  // --- REMOVE / HIDE BANDS FROM FRONT SCREEN ---
  hideBand(bandId) {
    this.data.hiddenBands[bandId] = true;
    // Also remove from custom bands if present
    this.data.customBands = (this.data.customBands || []).filter(b => b.id !== bandId);
    this.saveLocal();
  }

  isBandHidden(bandId) {
    return !!this.data.hiddenBands[bandId];
  }

  unhideAllBands() {
    this.data.hiddenBands = {};
    this.saveLocal();
  }

  // --- 1. FAVORITE SONGS ---
  isFavoriteSong(trackId) {
    return !!this.data.favoriteSongs[trackId];
  }

  toggleFavoriteSong(track) {
    if (!track || !track.id) return false;
    if (this.data.favoriteSongs[track.id]) {
      delete this.data.favoriteSongs[track.id];
      this.saveLocal();
      return false;
    } else {
      this.data.favoriteSongs[track.id] = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        cover: track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
        durationMs: track.durationMs || 0,
        formattedDuration: track.formattedDuration || '3:30',
        previewUrl: track.previewUrl || '',
        youtubeSearchQuery: track.youtubeSearchQuery || `${track.artist} - ${track.title} official audio`,
        addedAt: Date.now()
      };
      this.saveLocal();
      return true;
    }
  }

  getFavoriteSongs() {
    return Object.values(this.data.favoriteSongs || {});
  }

  // --- 2. FAVORITE ALBUMS ---
  isFavoriteAlbum(albumId) {
    return !!this.data.favoriteAlbums[albumId];
  }

  toggleFavoriteAlbum(album) {
    if (!album || !album.id) return false;
    if (this.data.favoriteAlbums[album.id]) {
      delete this.data.favoriteAlbums[album.id];
      this.saveLocal();
      return false;
    } else {
      this.data.favoriteAlbums[album.id] = {
        id: album.id,
        rawCollectionId: album.rawCollectionId,
        title: album.title,
        artist: album.artist,
        releaseYear: album.releaseYear,
        cover: album.cover,
        trackCount: album.trackCount || 0,
        addedAt: Date.now()
      };
      this.saveLocal();
      return true;
    }
  }

  getFavoriteAlbums() {
    return Object.values(this.data.favoriteAlbums || {});
  }

  // --- 3. FAVORITE BANDS (MY COLLECTION) ---
  isFavoriteBand(bandId) {
    return !!this.data.favoriteBands[bandId];
  }

  toggleFavoriteBand(band) {
    if (!band || !band.id) return false;
    if (this.data.favoriteBands[band.id]) {
      delete this.data.favoriteBands[band.id];
      this.saveLocal();
      return false;
    } else {
      this.data.favoriteBands[band.id] = {
        id: band.id,
        name: band.name,
        genre: band.genre || 'Music',
        image: band.image,
        bioSummary: band.bioSummary || '',
        addedAt: Date.now()
      };
      // If was hidden, unhide it
      if (this.data.hiddenBands[band.id]) {
        delete this.data.hiddenBands[band.id];
      }
      this.saveLocal();
      return true;
    }
  }

  getFavoriteBands() {
    return Object.values(this.data.favoriteBands || {});
  }

  // --- CUSTOM BANDS ---
  getCustomBands() {
    return this.data.customBands || [];
  }

  addCustomBand(band) {
    if (!this.data.customBands) this.data.customBands = [];
    const exists = this.data.customBands.some(b => b.id === band.id || b.name.toLowerCase() === band.name.toLowerCase());
    if (!exists) {
      this.data.customBands.unshift(band);
      this.saveLocal();
      return true;
    }
    return false;
  }

  // --- GOOGLE / YOUTUBE ACCOUNT PROFILE ---
  setUserProfile(profile) {
    this.data.userProfile = profile;
    this.currentUser = profile;
    this.saveLocal();
  }

  clearUserProfile() {
    this.data.userProfile = null;
    this.currentUser = null;
    this.saveLocal();
  }

  getUserProfile() {
    return this.data.userProfile;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadLocal();
  }
}

export const storage = new StorageManager();
