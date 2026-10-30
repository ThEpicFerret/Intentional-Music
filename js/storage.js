/**
 * Intentional Music — Storage & Cloud Sync Manager
 * Supports:
 *  1. Local-first storage via browser LocalStorage (100% private, zero setup)
 *  2. Firebase Google Authentication + Cloud Firestore Sync (optional multi-device)
 */

const STORAGE_KEY = 'intentional_music_vault_v1';

class StorageManager {
  constructor() {
    this.data = this.loadLocal();
    this.firebaseApp = null;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
  }

  loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse local storage, resetting:', e);
    }
    return {
      customBands: [],
      trackProgress: {}, // trackId: { completed: bool, playCount: number, duration: number, lastPlayed: number }
      likes: {}, // trackId: bool
      settings: {
        firebaseConfig: null
      }
    };
  }

  saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
    if (this.currentUser && this.db) {
      this.syncToCloud();
    }
  }

  // --- Track Completion & 90% Rule Storage ---
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

  // --- Likes ---
  isLiked(trackId) {
    return !!this.data.likes[trackId];
  }

  toggleLike(trackId) {
    this.data.likes[trackId] = !this.data.likes[trackId];
    this.saveLocal();
    return this.data.likes[trackId];
  }

  // --- Custom Bands Added by User Search ---
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

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadLocal();
  }

  // --- Optional Firebase Cloud Sync ---
  async initFirebase(config) {
    if (!config || !config.apiKey) return false;
    try {
      // Dynamic import of Firebase Modular SDK via official CDN
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
      const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      const { getFirestore, doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

      this.firebaseApp = initializeApp(config);
      this.auth = getAuth(this.firebaseApp);
      this.db = getFirestore(this.firebaseApp);

      return {
        auth: this.auth,
        signIn: () => signInWithPopup(this.auth, new GoogleAuthProvider()),
        signOut: () => signOut(this.auth),
        onAuthStateChanged: (cb) => onAuthStateChanged(this.auth, async (user) => {
          this.currentUser = user;
          if (user) {
            await this.loadFromCloud();
          }
          cb(user);
        })
      };
    } catch (e) {
      console.error('Firebase initialization error:', e);
      return false;
    }
  }

  async syncToCloud() {
    if (!this.currentUser || !this.db) return;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      await setDoc(userRef, {
        vault: this.data,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }
  }

  async loadFromCloud() {
    if (!this.currentUser || !this.db) return;
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().vault) {
        const cloudVault = snap.data().vault;
        // Merge cloud with local progress
        this.data.trackProgress = { ...this.data.trackProgress, ...(cloudVault.trackProgress || {}) };
        this.data.likes = { ...this.data.likes, ...(cloudVault.likes || {}) };
        if (cloudVault.customBands) {
          const merged = [...(this.data.customBands || [])];
          for (const b of cloudVault.customBands) {
            if (!merged.some(m => m.id === b.id)) merged.push(b);
          }
          this.data.customBands = merged;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn('Cloud fetch error:', e);
    }
  }
}

export const storage = new StorageManager();
