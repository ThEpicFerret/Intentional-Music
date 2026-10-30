/**
 * Intentional Music — Main Application Controller
 * Handles:
 *  - 100% Infallible Instant Audio Playback & 90% Listen Rule
 *  - Unified Search (Songs, Albums, Bands) with Enter key execution
 *  - Dedicated Favorites System (Separate for Songs, Albums, and Bands)
 *  - Google / YouTube Account Connect & direct YouTube Music shortcuts
 *  - Native Browser Back/Forward navigation & history
 */

import { storage } from './storage.js';
import { MusicAPI } from './api.js';
import { VaultManager } from './vault.js';
import { DisguisedPlayer } from './player.js';

class App {
  constructor() {
    this.currentView = 'vault'; // 'vault' | 'artist' | 'album' | 'search' | 'favorites'
    this.selectedBand = null;
    this.selectedAlbum = null;
    this.activeGenre = 'all';
    this.activeCompletionFilter = 'all';
    this.activeFavTab = 'songs'; // 'songs' | 'albums' | 'bands'

    // Initialize Audio Engine
    this.player = new DisguisedPlayer({
      onTrackChange: (track, album) => this.handleTrackChange(track, album),
      onSongCompleted: (track, album) => this.handleSongCompleted(track, album),
      onProgressUpdate: (data) => this.handleProgressUpdate(data),
      onPlayStateChange: (isPlaying) => this.handlePlayStateChange(isPlaying)
    });

    this.initDOM();
    this.bindEvents();
    this.initHistory();
    this.renderVault();
    this.updateFavoritesBadges();
    this.checkUserProfile();
  }

  initDOM() {
    if (window.lucide) window.lucide.createIcons();

    this.elements = {
      // Top Navigation
      navBrand: document.getElementById('nav-brand'),
      navHistoryBack: document.getElementById('nav-history-back'),
      navHistoryForward: document.getElementById('nav-history-forward'),
      navBtnFavorites: document.getElementById('nav-btn-favorites'),
      navFavBadge: document.getElementById('nav-fav-badge'),

      // Views
      viewVault: document.getElementById('view-vault'),
      viewSearch: document.getElementById('view-search'),
      viewFavorites: document.getElementById('view-favorites'),
      viewArtist: document.getElementById('view-artist'),
      viewAlbum: document.getElementById('view-album'),

      // Search
      searchForm: document.getElementById('global-search-form'),
      searchInput: document.getElementById('global-search-input'),
      searchDropdown: document.getElementById('search-results-dropdown'),
      searchQueryDisplay: document.getElementById('search-query-display'),
      searchSongsList: document.getElementById('search-songs-list'),
      searchAlbumsGrid: document.getElementById('search-albums-grid'),
      searchArtistsGrid: document.getElementById('search-artists-grid'),
      btnSearchBackVault: document.getElementById('btn-search-back-vault'),

      // Favorites View Elements
      btnFavBackVault: document.getElementById('btn-fav-back-vault'),
      tabFavSongs: document.getElementById('tab-fav-songs'),
      tabFavAlbums: document.getElementById('tab-fav-albums'),
      tabFavBands: document.getElementById('tab-fav-bands'),
      favCountSongs: document.getElementById('fav-count-songs'),
      favCountAlbums: document.getElementById('fav-count-albums'),
      favCountBands: document.getElementById('fav-count-bands'),
      panelFavSongs: document.getElementById('panel-fav-songs'),
      panelFavAlbums: document.getElementById('panel-fav-albums'),
      panelFavBands: document.getElementById('panel-fav-bands'),
      favSongsContainer: document.getElementById('fav-songs-container'),
      favAlbumsContainer: document.getElementById('fav-albums-container'),
      favBandsContainer: document.getElementById('fav-bands-container'),

      // Vault Grid
      bandsGrid: document.getElementById('bands-grid'),
      vaultEmptyState: document.getElementById('vault-empty-state'),
      statTotalBands: document.getElementById('stat-total-bands'),
      statSongsCompleted: document.getElementById('stat-songs-completed'),
      statGoldMastered: document.getElementById('stat-gold-mastered'),
      headerVaultRate: document.getElementById('header-vault-rate'),
      completionFilter: document.getElementById('completion-filter'),

      // Artist View
      artistHeroCard: document.getElementById('artist-hero-card'),
      artistAlbumCount: document.getElementById('artist-album-count'),
      artistAlbumsList: document.getElementById('artist-albums-list'),
      btnBackToVault: document.getElementById('btn-back-to-vault'),
      btnFavBandToggle: document.getElementById('btn-fav-band-toggle'),
      favBandBtnText: document.getElementById('fav-band-btn-text'),
      btnArtistInfo: document.getElementById('btn-artist-info'),

      // Album View
      albumHeaderContainer: document.getElementById('album-header-container'),
      albumTracksTbody: document.getElementById('album-tracks-tbody'),
      btnBackToArtist: document.getElementById('btn-back-to-artist'),
      backToArtistName: document.getElementById('back-to-artist-name'),
      btnFavAlbumToggle: document.getElementById('btn-fav-album-toggle'),
      favAlbumBtnText: document.getElementById('fav-album-btn-text'),
      btnPlayFullAlbum: document.getElementById('btn-play-full-album'),

      // Player Dock
      playerTrackArt: document.getElementById('player-track-art'),
      playerTrackTitle: document.getElementById('player-track-title'),
      playerTrackArtist: document.getElementById('player-track-artist'),
      playerTrackAlbum: document.getElementById('player-track-album'),
      playerTrackCompletedBadge: document.getElementById('player-track-completed-badge'),
      btnPlayerPlayToggle: document.getElementById('btn-player-play-toggle'),
      playerPlayIcon: document.getElementById('player-play-icon'),
      btnPlayerPrev: document.getElementById('btn-player-prev'),
      btnPlayerNext: document.getElementById('btn-player-next'),
      playerCurrentTime: document.getElementById('player-current-time'),
      playerDuration: document.getElementById('player-duration'),
      playerProgressFill: document.getElementById('player-progress-fill'),
      playerProgressContainer: document.getElementById('player-progress-container'),
      playerCompletionPct: document.getElementById('player-completion-pct'),
      playerVolumeSlider: document.getElementById('player-volume-slider'),
      btnPlayerMute: document.getElementById('btn-player-mute'),
      btnPlayerLike: document.getElementById('btn-player-like'),
      btnPlayerYtm: document.getElementById('btn-player-ytm'),

      // Modals
      modalGoogleLogin: document.getElementById('modal-google-login'),
      btnGoogleLogin: document.getElementById('btn-google-login'),
      googleLoginLabel: document.getElementById('google-login-label'),
      btnExecuteGoogleLogin: document.getElementById('btn-execute-google-login'),
      btnCloseGoogleModal: document.getElementById('btn-close-google-modal'),

      modalArtistBio: document.getElementById('modal-artist-bio'),
      bioModalTitle: document.getElementById('bio-modal-title'),
      bioModalMembers: document.getElementById('bio-modal-members'),
      bioModalExtract: document.getElementById('bio-modal-extract'),
      bioModalExtLink: document.getElementById('bio-modal-ext-link'),
      btnCloseBioModal: document.getElementById('btn-close-bio-modal'),

      modalSettings: document.getElementById('modal-settings'),
      btnSettings: document.getElementById('btn-settings'),
      btnCloseSettings: document.getElementById('btn-close-settings'),
      btnResetStorage: document.getElementById('btn-reset-storage'),

      toastContainer: document.getElementById('toast-container')
    };
  }

  // ================= BROWSER HISTORY & NAVIGATION =================
  initHistory() {
    history.replaceState({ view: 'vault' }, '', window.location.pathname + '#/vault');

    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.navigateTo(e.state.view, e.state, false);
      } else {
        this.navigateTo('vault', {}, false);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        window.history.back();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        window.history.forward();
      }
    });
  }

  navigateTo(view, state = {}, pushHistory = true) {
    this.currentView = view;
    this.elements.viewVault.classList.add('hidden');
    this.elements.viewSearch.classList.add('hidden');
    this.elements.viewFavorites.classList.add('hidden');
    this.elements.viewArtist.classList.add('hidden');
    this.elements.viewAlbum.classList.add('hidden');

    if (view === 'vault') {
      this.selectedBand = null;
      this.selectedAlbum = null;
      this.elements.viewVault.classList.remove('hidden');
      this.renderVault();
      if (pushHistory) history.pushState({ view: 'vault' }, '', window.location.pathname + '#/vault');
    } else if (view === 'search') {
      this.elements.viewSearch.classList.remove('hidden');
      if (pushHistory) history.pushState({ view: 'search' }, '', window.location.pathname + '#/search');
    } else if (view === 'favorites') {
      this.elements.viewFavorites.classList.remove('hidden');
      this.renderFavoritesView();
      if (pushHistory) history.pushState({ view: 'favorites' }, '', window.location.pathname + '#/favorites');
    } else if (view === 'artist') {
      if (state.band) this.selectedBand = state.band;
      this.selectedAlbum = null;
      this.elements.viewArtist.classList.remove('hidden');
      this.renderArtistView();
      if (pushHistory) {
        const slug = encodeURIComponent(this.selectedBand?.name || 'artist');
        history.pushState({ view: 'artist', band: this.selectedBand }, '', window.location.pathname + `#/artist/${slug}`);
      }
    } else if (view === 'album') {
      if (state.album) this.selectedAlbum = state.album;
      if (state.band) this.selectedBand = state.band;
      this.elements.viewAlbum.classList.remove('hidden');
      this.renderAlbumView();
      if (pushHistory) {
        const slug = encodeURIComponent(this.selectedAlbum?.id || 'album');
        history.pushState({ view: 'album', album: this.selectedAlbum, band: this.selectedBand }, '', window.location.pathname + `#/album/${slug}`);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    // Navigation Brand
    this.elements.navBrand.addEventListener('click', () => this.navigateTo('vault'));

    // Top Navigation Back & Forward
    this.elements.navHistoryBack.addEventListener('click', () => window.history.back());
    this.elements.navHistoryForward.addEventListener('click', () => window.history.forward());

    // Favorites Nav Link
    this.elements.navBtnFavorites.addEventListener('click', () => this.navigateTo('favorites'));
    this.elements.btnFavBackVault.addEventListener('click', () => this.navigateTo('vault'));
    this.elements.btnSearchBackVault.addEventListener('click', () => this.navigateTo('vault'));

    // In-page Back Buttons
    this.elements.btnBackToVault.addEventListener('click', () => window.history.back());
    this.elements.btnBackToArtist.addEventListener('click', () => window.history.back());

    // ================= UNIFIED SEARCH (PRESS ENTER TO SEARCH SONGS/ALBUMS/BANDS) =================
    this.elements.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.executeFullSearch();
    });

    let debounceTimer = null;
    this.elements.searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.handleLiveSearchDropdown(), 250);
    });

    document.addEventListener('click', (e) => {
      if (!this.elements.searchForm.contains(e.target) && !this.elements.searchDropdown.contains(e.target)) {
        this.elements.searchDropdown.classList.add('hidden');
      }
    });

    // Favorites Category Tabs
    this.elements.tabFavSongs.addEventListener('click', () => this.switchFavTab('songs'));
    this.elements.tabFavAlbums.addEventListener('click', () => this.switchFavTab('albums'));
    this.elements.tabFavBands.addEventListener('click', () => this.switchFavTab('bands'));

    // Genre filter pills
    document.querySelectorAll('.genre-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.genre-pill').forEach(p => {
          p.classList.remove('bg-red-600', 'text-white', 'shadow-md', 'shadow-red-900/30');
          p.classList.add('bg-vault-850', 'text-neutral-300');
        });
        btn.classList.add('bg-red-600', 'text-white', 'shadow-md', 'shadow-red-900/30');
        btn.classList.remove('bg-vault-850', 'text-neutral-300');

        this.activeGenre = btn.getAttribute('data-genre');
        this.renderVault();
      });
    });

    this.elements.completionFilter.addEventListener('change', (e) => {
      this.activeCompletionFilter = e.target.value;
      this.renderVault();
    });

    // Artist Info & Bio Modal
    this.elements.btnArtistInfo.addEventListener('click', () => this.openArtistBioModal());
    this.elements.btnCloseBioModal.addEventListener('click', () => {
      this.elements.modalArtistBio.classList.add('hidden');
      this.elements.modalArtistBio.classList.remove('flex');
    });

    // Google / YouTube Sign In Modal
    this.elements.btnGoogleLogin.addEventListener('click', () => {
      const profile = storage.getUserProfile();
      if (profile) {
        if (confirm(`Signed in as ${profile.name} (${profile.email}). Do you want to sign out?`)) {
          storage.clearUserProfile();
          this.checkUserProfile();
          this.showToast('Signed out of YouTube account', 'info');
        }
      } else {
        this.elements.modalGoogleLogin.classList.remove('hidden');
        this.elements.modalGoogleLogin.classList.add('flex');
      }
    });

    this.elements.btnCloseGoogleModal.addEventListener('click', () => {
      this.elements.modalGoogleLogin.classList.add('hidden');
      this.elements.modalGoogleLogin.classList.remove('flex');
    });

    this.elements.btnExecuteGoogleLogin.addEventListener('click', () => {
      // Simulate/Trigger Google Sign-In prompt
      const email = prompt('Enter your Google / YouTube Account Email to connect:', 'user@gmail.com');
      if (email && email.includes('@')) {
        const name = email.split('@')[0];
        const profile = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
        };
        storage.setUserProfile(profile);
        this.checkUserProfile();
        this.elements.modalGoogleLogin.classList.add('hidden');
        this.elements.modalGoogleLogin.classList.remove('flex');
        this.showToast(`Connected YouTube Account: ${profile.name}!`, 'success');
      }
    });

    // Settings Modal
    this.elements.btnSettings.addEventListener('click', () => {
      this.elements.modalSettings.classList.remove('hidden');
      this.elements.modalSettings.classList.add('flex');
    });
    this.elements.btnCloseSettings.addEventListener('click', () => {
      this.elements.modalSettings.classList.add('hidden');
      this.elements.modalSettings.classList.remove('flex');
    });
    this.elements.btnResetStorage.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your vault progress, favorites, and unlocked achievements?')) {
        storage.resetAll();
        this.renderVault();
        this.updateFavoritesBadges();
        this.showToast('Vault data reset.', 'info');
        this.elements.modalSettings.classList.add('hidden');
      }
    });

    // Favorite Band Toggle (in Artist View)
    this.elements.btnFavBandToggle.addEventListener('click', () => {
      if (!this.selectedBand) return;
      const isFav = storage.toggleFavoriteBand(this.selectedBand);
      this.updateFavBandButtonUI(isFav);
      this.updateFavoritesBadges();
      this.showToast(isFav ? `Added ${this.selectedBand.name} to Favorite Bands` : `Removed ${this.selectedBand.name} from Favorites`, 'info');
    });

    // Favorite Album Toggle (in Album View)
    this.elements.btnFavAlbumToggle.addEventListener('click', () => {
      if (!this.selectedAlbum) return;
      const isFav = storage.toggleFavoriteAlbum(this.selectedAlbum);
      this.updateFavAlbumButtonUI(isFav);
      this.updateFavoritesBadges();
      this.showToast(isFav ? `Added ${this.selectedAlbum.title} to Favorite Albums` : `Removed from Favorites`, 'info');
    });

    // Player Controls
    this.elements.btnPlayerPlayToggle.addEventListener('click', () => {
      if (!this.player.currentTrack) {
        if (this.selectedAlbum && this.selectedAlbum.tracks && this.selectedAlbum.tracks.length > 0) {
          this.player.playTrack(this.selectedAlbum.tracks[0], this.selectedAlbum, this.selectedAlbum.tracks);
          return;
        }
      }
      this.player.togglePlayPause();
    });

    this.elements.btnPlayerPrev.addEventListener('click', () => this.player.playPrev());
    this.elements.btnPlayerNext.addEventListener('click', () => this.player.playNext());

    this.elements.playerProgressContainer.addEventListener('click', (e) => {
      const rect = this.elements.playerProgressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      this.player.seekToRatio(ratio);
    });

    this.elements.playerVolumeSlider.addEventListener('input', (e) => {
      this.player.setVolume(parseInt(e.target.value, 10));
    });

    this.elements.btnPlayerMute.addEventListener('click', () => {
      const current = parseInt(this.elements.playerVolumeSlider.value, 10);
      if (current > 0) {
        this.player.setVolume(0);
        this.elements.playerVolumeSlider.value = 0;
      } else {
        this.player.setVolume(80);
        this.elements.playerVolumeSlider.value = 80;
      }
    });

    this.elements.btnPlayerLike.addEventListener('click', () => {
      if (!this.player.currentTrack) return;
      const isFav = storage.toggleFavoriteSong(this.player.currentTrack);
      this.updatePlayerLikeIcon(isFav);
      this.updateFavoritesBadges();
      this.showToast(isFav ? `Added "${this.player.currentTrack.title}" to Favorite Songs` : `Removed from Favorite Songs`, 'info');
      this.updateTrackTableStatus(this.player.currentTrack.id);
    });

    // Play Full Album In Order
    this.elements.btnPlayFullAlbum.addEventListener('click', () => {
      if (this.selectedAlbum && this.selectedAlbum.tracks && this.selectedAlbum.tracks.length > 0) {
        const firstTrack = this.selectedAlbum.tracks[0];
        this.player.playTrack(firstTrack, this.selectedAlbum, this.selectedAlbum.tracks);
        this.showToast(`Playing ${this.selectedAlbum.title} in order`, 'info');
      }
    });
  }

  checkUserProfile() {
    const profile = storage.getUserProfile();
    if (profile) {
      this.elements.googleLoginLabel.textContent = profile.name;
      this.elements.btnGoogleLogin.classList.add('bg-red-950/40', 'border-red-800/60');
    } else {
      this.elements.googleLoginLabel.textContent = 'YouTube Login';
      this.elements.btnGoogleLogin.classList.remove('bg-red-950/40', 'border-red-800/60');
    }
  }

  // ================= 1. VAULT VIEW (STEAM LIBRARY) =================
  renderVault() {
    const bands = VaultManager.getAllBands();
    const stats = VaultManager.getOverallStats();

    this.elements.statTotalBands.textContent = bands.length;
    this.elements.statSongsCompleted.textContent = stats.totalCompleted;
    this.elements.statGoldMastered.textContent = stats.masteredBands;
    this.elements.headerVaultRate.textContent = `${stats.vaultRate}%`;

    let filtered = bands;
    if (this.activeGenre !== 'all') {
      filtered = filtered.filter(b => b.genre && b.genre.toLowerCase().includes(this.activeGenre.toLowerCase()));
    }

    if (this.activeCompletionFilter !== 'all') {
      filtered = filtered.filter(b => {
        const bStats = VaultManager.getBandStats(b);
        if (this.activeCompletionFilter === 'unplayed') return bStats.status === 'locked';
        if (this.activeCompletionFilter === 'in-progress') return bStats.status === 'in-progress';
        if (this.activeCompletionFilter === 'completed') return bStats.status === 'mastered';
        return true;
      });
    }

    if (filtered.length === 0) {
      this.elements.bandsGrid.innerHTML = '';
      this.elements.vaultEmptyState.classList.remove('hidden');
      this.elements.vaultEmptyState.classList.add('flex');
      return;
    }

    this.elements.vaultEmptyState.classList.add('hidden');
    this.elements.vaultEmptyState.classList.remove('flex');

    this.elements.bandsGrid.innerHTML = filtered.map(band => {
      const bStats = VaultManager.getBandStats(band);

      let cardClass = 'band-locked';
      let borderStyle = 'border-vault-800';
      let statusBadge = `<span class="text-[10px] px-2 py-0.5 rounded-full bg-vault-800 text-neutral-400">Locked</span>`;
      let barColor = 'bg-neutral-600';

      if (bStats.status === 'mastered') {
        cardClass = 'band-mastered animate-glow-gold';
        borderStyle = 'border-amber-400';
        statusBadge = `<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold flex items-center gap-1">★ 100% Mastered</span>`;
        barColor = 'bg-amber-400';
      } else if (bStats.status === 'in-progress') {
        cardClass = 'band-in-progress';
        borderStyle = 'border-vault-700 hover:border-red-500/60';
        statusBadge = `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold">${bStats.percentage}% Listened</span>`;
        barColor = 'bg-emerald-500';
      }

      return `
        <div class="band-card ${cardClass} group cursor-pointer bg-vault-900 border ${borderStyle} rounded-2xl overflow-hidden p-3 flex flex-col justify-between" data-band-id="${band.id}">
          <div>
            <div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-vault-850 shadow-inner">
              <img src="${band.image}" alt="${band.name}" class="band-art w-full h-full object-cover">
              
              <div class="mastered-crown hidden absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-vault-950 items-center justify-center font-bold shadow-lg shadow-amber-500/40">
                <i data-lucide="crown" class="w-4 h-4 fill-current"></i>
              </div>

              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                ${statusBadge}
              </div>
            </div>

            <h4 class="font-display font-bold text-sm text-neutral-100 group-hover:text-white truncate tracking-tight">
              ${band.name}
            </h4>
            <p class="text-[11px] text-neutral-400 truncate mt-0.5">
              ${band.genre || 'Various'}
            </p>
          </div>

          <div class="mt-3 pt-2 border-t border-vault-800/70">
            <div class="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
              <span>${bStats.completedSongs} completed</span>
              <span class="font-bold font-mono">${bStats.percentage}%</span>
            </div>
            <div class="w-full h-1.5 bg-vault-800 rounded-full overflow-hidden">
              <div class="${barColor} h-full rounded-full transition-all duration-300" style="width: ${bStats.percentage}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.elements.bandsGrid.querySelectorAll('.band-card').forEach(card => {
      card.addEventListener('click', () => {
        const bandId = card.getAttribute('data-band-id');
        const found = bands.find(b => b.id === bandId);
        if (found) {
          this.openArtist(found);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 2. FULL SEARCH VIEW (SONGS, ALBUMS, BANDS) =================
  async executeFullSearch() {
    const query = this.elements.searchInput.value.trim();
    if (!query) return;

    this.elements.searchDropdown.classList.add('hidden');
    this.elements.searchQueryDisplay.textContent = query;
    this.navigateTo('search', {}, true);

    this.elements.searchSongsList.innerHTML = `<div class="p-8 text-center text-xs text-neutral-400"><i data-lucide="loader-2" class="w-6 h-6 text-red-500 animate-spin mx-auto mb-2"></i>Searching for songs...</div>`;
    this.elements.searchAlbumsGrid.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-neutral-400"><i data-lucide="loader-2" class="w-6 h-6 text-red-500 animate-spin mx-auto mb-2"></i>Searching albums...</div>`;
    this.elements.searchArtistsGrid.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-neutral-400"><i data-lucide="loader-2" class="w-6 h-6 text-red-500 animate-spin mx-auto mb-2"></i>Searching artists...</div>`;
    if (window.lucide) window.lucide.createIcons();

    const results = await MusicAPI.searchUnified(query);

    // 1. Render Matching Songs
    if (results.songs.length === 0) {
      this.elements.searchSongsList.innerHTML = `<div class="p-6 text-center text-xs text-neutral-500">No songs found matching "${query}".</div>`;
    } else {
      this.elements.searchSongsList.innerHTML = results.songs.map((song, idx) => {
        const isFav = storage.isFavoriteSong(song.id);
        const isCompleted = storage.isSongCompleted(song.id);

        return `
          <div class="search-song-row p-3 hover:bg-vault-800/80 cursor-pointer flex items-center justify-between gap-3 transition-colors" data-index="${idx}">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-vault-800 shrink-0 border border-vault-700 relative group">
                <img src="${song.cover}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i data-lucide="play" class="w-4 h-4 fill-white text-white"></i>
                </div>
              </div>
              <div class="min-w-0">
                <h5 class="text-sm font-semibold text-white truncate">${song.title}</h5>
                <p class="text-xs text-neutral-400 truncate">${song.artist} • ${song.album}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              ${isCompleted ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800/40">Completed</span>` : ''}
              <span class="text-xs font-mono text-neutral-400">${song.formattedDuration}</span>
              <button class="btn-fav-song p-1.5 text-neutral-500 hover:text-red-500 transition-colors" data-id="${song.id}">
                <i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      this.elements.searchSongsList.querySelectorAll('.search-song-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.btn-fav-song')) return;
          const idx = parseInt(row.getAttribute('data-index'), 10);
          const song = results.songs[idx];
          if (song) {
            this.player.playTrack(song, { title: song.album, cover: song.cover }, results.songs);
            this.showToast(`Playing "${song.title}"`, 'info');
          }
        });
      });

      this.elements.searchSongsList.querySelectorAll('.btn-fav-song').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const songId = btn.getAttribute('data-id');
          const song = results.songs.find(s => s.id === songId);
          if (song) {
            const isFav = storage.toggleFavoriteSong(song);
            this.updateFavoritesBadges();
            this.showToast(isFav ? `Added to Favorite Songs` : `Removed from Favorites`, 'info');
            btn.innerHTML = `<i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}"></i>`;
            if (window.lucide) window.lucide.createIcons();
          }
        });
      });
    }

    // 2. Render Matching Albums
    if (results.albums.length === 0) {
      this.elements.searchAlbumsGrid.innerHTML = `<div class="col-span-full p-6 text-center text-xs text-neutral-500">No albums found.</div>`;
    } else {
      this.elements.searchAlbumsGrid.innerHTML = results.albums.map(alb => `
        <div class="search-album-card group cursor-pointer bg-vault-900 border border-vault-800 hover:border-vault-700 rounded-2xl p-3 flex flex-col justify-between transition-all" data-id="${alb.id}">
          <div class="w-full aspect-square rounded-xl overflow-hidden bg-vault-800 mb-2 border border-vault-700 shadow-md">
            <img src="${alb.cover}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
          </div>
          <div>
            <span class="text-[10px] font-mono text-neutral-500">${alb.releaseYear}</span>
            <h5 class="text-xs font-bold text-white group-hover:text-red-400 truncate">${alb.title}</h5>
            <p class="text-[11px] text-neutral-400 truncate">${alb.artist}</p>
          </div>
        </div>
      `).join('');

      this.elements.searchAlbumsGrid.querySelectorAll('.search-album-card').forEach(card => {
        card.addEventListener('click', () => {
          const albId = card.getAttribute('data-id');
          const found = results.albums.find(a => a.id === albId);
          if (found) {
            this.openAlbum(found);
          }
        });
      });
    }

    // 3. Render Matching Artists
    if (results.artists.length === 0) {
      this.elements.searchArtistsGrid.innerHTML = `<div class="col-span-full p-6 text-center text-xs text-neutral-500">No artists found.</div>`;
    } else {
      this.elements.searchArtistsGrid.innerHTML = results.artists.map(art => `
        <div class="search-artist-card group cursor-pointer bg-vault-900 border border-vault-800 hover:border-vault-700 rounded-2xl p-3 flex flex-col items-center text-center transition-all" data-id="${art.id}">
          <div class="w-20 h-20 rounded-full overflow-hidden bg-vault-800 mb-2 border border-vault-700 shadow-md">
            <img src="${art.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
          </div>
          <h5 class="text-xs font-bold text-white group-hover:text-red-400 truncate w-full">${art.name}</h5>
          <p class="text-[11px] text-neutral-400 truncate">${art.genre || 'Artist'}</p>
          <span class="mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">Add to Vault</span>
        </div>
      `).join('');

      this.elements.searchArtistsGrid.querySelectorAll('.search-artist-card').forEach(card => {
        card.addEventListener('click', () => {
          const artId = card.getAttribute('data-id');
          const found = results.artists.find(a => a.id === artId);
          if (found) {
            storage.addCustomBand(found);
            this.openArtist(found);
          }
        });
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  async handleLiveSearchDropdown() {
    const query = this.elements.searchInput.value.trim();
    if (query.length < 2) {
      this.elements.searchDropdown.classList.add('hidden');
      return;
    }

    this.elements.searchDropdown.classList.remove('hidden');
    this.elements.searchDropdown.innerHTML = `
      <div class="p-3 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <i data-lucide="loader-2" class="w-3.5 h-3.5 text-red-500 animate-spin"></i>
        Searching songs, albums, and artists...
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    const results = await MusicAPI.searchUnified(query);

    let html = '';
    // Show top 3 songs
    if (results.songs.length > 0) {
      html += `<div class="p-2 text-[10px] uppercase font-bold text-neutral-400 bg-vault-950/60">Songs</div>`;
      for (const s of results.songs.slice(0, 3)) {
        html += `
          <div class="dropdown-item p-2.5 hover:bg-vault-800 cursor-pointer flex items-center justify-between" data-type="song" data-id="${s.id}">
            <div class="flex items-center gap-2.5 min-w-0">
              <img src="${s.cover}" class="w-7 h-7 rounded object-cover">
              <div class="min-w-0">
                <div class="text-xs font-semibold text-white truncate">${s.title}</div>
                <div class="text-[11px] text-neutral-400 truncate">${s.artist}</div>
              </div>
            </div>
            <span class="text-[11px] text-neutral-500 font-mono">${s.formattedDuration}</span>
          </div>
        `;
      }
    }

    // Show top 2 artists
    if (results.artists.length > 0) {
      html += `<div class="p-2 text-[10px] uppercase font-bold text-neutral-400 bg-vault-950/60">Artists</div>`;
      for (const a of results.artists.slice(0, 2)) {
        html += `
          <div class="dropdown-item p-2.5 hover:bg-vault-800 cursor-pointer flex items-center gap-2.5" data-type="artist" data-name="${encodeURIComponent(a.name)}">
            <img src="${a.image}" class="w-7 h-7 rounded-full object-cover">
            <div class="text-xs font-semibold text-white truncate">${a.name}</div>
          </div>
        `;
      }
    }

    html += `
      <div id="dropdown-view-all" class="p-2.5 text-center text-xs font-semibold text-red-400 hover:bg-vault-800 cursor-pointer border-t border-vault-800">
        Press Enter to view all results for "${query}" →
      </div>
    `;

    this.elements.searchDropdown.innerHTML = html;

    document.getElementById('dropdown-view-all')?.addEventListener('click', () => {
      this.executeFullSearch();
    });

    this.elements.searchDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.getAttribute('data-type');
        this.elements.searchDropdown.classList.add('hidden');
        if (type === 'song') {
          const songId = item.getAttribute('data-id');
          const song = results.songs.find(s => s.id === songId);
          if (song) {
            this.player.playTrack(song, { title: song.album, cover: song.cover }, results.songs);
          }
        } else if (type === 'artist') {
          const artistName = decodeURIComponent(item.getAttribute('data-name'));
          const artist = results.artists.find(a => a.name === artistName);
          if (artist) {
            this.openArtist(artist);
          }
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 3. FAVORITES VIEW (SONGS, ALBUMS, BANDS) =================
  switchFavTab(tab) {
    this.activeFavTab = tab;
    [this.elements.tabFavSongs, this.elements.tabFavAlbums, this.elements.tabFavBands].forEach(b => {
      b.classList.remove('bg-red-600', 'text-white', 'shadow');
      b.classList.add('bg-vault-850', 'text-neutral-300');
    });

    [this.elements.panelFavSongs, this.elements.panelFavAlbums, this.elements.panelFavBands].forEach(p => p.classList.add('hidden'));

    if (tab === 'songs') {
      this.elements.tabFavSongs.classList.add('bg-red-600', 'text-white', 'shadow');
      this.elements.tabFavSongs.classList.remove('bg-vault-850', 'text-neutral-300');
      this.elements.panelFavSongs.classList.remove('hidden');
    } else if (tab === 'albums') {
      this.elements.tabFavAlbums.classList.add('bg-red-600', 'text-white', 'shadow');
      this.elements.tabFavAlbums.classList.remove('bg-vault-850', 'text-neutral-300');
      this.elements.panelFavAlbums.classList.remove('hidden');
    } else if (tab === 'bands') {
      this.elements.tabFavBands.classList.add('bg-red-600', 'text-white', 'shadow');
      this.elements.tabFavBands.classList.remove('bg-vault-850', 'text-neutral-300');
      this.elements.panelFavBands.classList.remove('hidden');
    }

    this.renderFavoritesView();
  }

  updateFavoritesBadges() {
    const favSongs = storage.getFavoriteSongs();
    const favAlbums = storage.getFavoriteAlbums();
    const favBands = storage.getFavoriteBands();

    const total = favSongs.length + favAlbums.length + favBands.length;
    this.elements.navFavBadge.textContent = total;
    this.elements.favCountSongs.textContent = favSongs.length;
    this.elements.favCountAlbums.textContent = favAlbums.length;
    this.elements.favCountBands.textContent = favBands.length;
  }

  renderFavoritesView() {
    this.updateFavoritesBadges();

    // 1. Render Favorite Songs
    const songs = storage.getFavoriteSongs();
    if (songs.length === 0) {
      this.elements.favSongsContainer.innerHTML = `
        <div class="p-12 text-center text-neutral-400">
          <i data-lucide="music" class="w-10 h-10 text-neutral-600 mx-auto mb-2"></i>
          <p class="text-sm font-semibold text-neutral-300">No favorite songs yet</p>
          <p class="text-xs text-neutral-500 mt-0.5">Click the heart icon on any song to save it here</p>
        </div>
      `;
    } else {
      this.elements.favSongsContainer.innerHTML = songs.map((s, idx) => `
        <div class="fav-song-row p-3 hover:bg-vault-800/80 cursor-pointer flex items-center justify-between gap-3 transition-colors" data-id="${s.id}" data-index="${idx}">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-vault-800 shrink-0 border border-vault-700 relative group">
              <img src="${s.cover}" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i data-lucide="play" class="w-4 h-4 fill-white text-white"></i>
              </div>
            </div>
            <div class="min-w-0">
              <h5 class="text-sm font-semibold text-white truncate">${s.title}</h5>
              <p class="text-xs text-neutral-400 truncate">${s.artist} • ${s.album}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono text-neutral-400">${s.formattedDuration}</span>
            <button class="btn-remove-fav-song p-1.5 text-red-500 hover:text-neutral-400 transition-colors" data-id="${s.id}">
              <i data-lucide="heart" class="w-4 h-4 fill-current"></i>
            </button>
          </div>
        </div>
      `).join('');

      this.elements.favSongsContainer.querySelectorAll('.fav-song-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.btn-remove-fav-song')) return;
          const idx = parseInt(row.getAttribute('data-index'), 10);
          this.player.playTrack(songs[idx], { title: songs[idx].album, cover: songs[idx].cover }, songs);
        });
      });

      this.elements.favSongsContainer.querySelectorAll('.btn-remove-fav-song').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sId = btn.getAttribute('data-id');
          const found = songs.find(s => s.id === sId);
          if (found) {
            storage.toggleFavoriteSong(found);
            this.renderFavoritesView();
          }
        });
      });
    }

    // 2. Render Favorite Albums
    const albums = storage.getFavoriteAlbums();
    if (albums.length === 0) {
      this.elements.favAlbumsContainer.innerHTML = `
        <div class="col-span-full p-12 text-center text-neutral-400 border border-dashed border-vault-800 rounded-3xl">
          <i data-lucide="disc" class="w-10 h-10 text-neutral-600 mx-auto mb-2"></i>
          <p class="text-sm font-semibold text-neutral-300">No favorite albums yet</p>
          <p class="text-xs text-neutral-500 mt-0.5">Click "Favorite Album" when exploring an album to keep it here</p>
        </div>
      `;
    } else {
      this.elements.favAlbumsContainer.innerHTML = albums.map(a => `
        <div class="fav-album-card group cursor-pointer bg-vault-900 border border-vault-800 hover:border-vault-700 rounded-2xl p-3 flex flex-col justify-between transition-all" data-id="${a.id}">
          <div class="w-full aspect-square rounded-xl overflow-hidden bg-vault-800 mb-2 border border-vault-700 shadow-md">
            <img src="${a.cover}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
          </div>
          <div>
            <span class="text-[10px] font-mono text-neutral-500">${a.releaseYear}</span>
            <h5 class="text-xs font-bold text-white group-hover:text-red-400 truncate">${a.title}</h5>
            <p class="text-[11px] text-neutral-400 truncate">${a.artist}</p>
          </div>
        </div>
      `).join('');

      this.elements.favAlbumsContainer.querySelectorAll('.fav-album-card').forEach(card => {
        card.addEventListener('click', () => {
          const aId = card.getAttribute('data-id');
          const found = albums.find(a => a.id === aId);
          if (found) this.openAlbum(found);
        });
      });
    }

    // 3. Render Favorite Bands
    const bands = storage.getFavoriteBands();
    if (bands.length === 0) {
      this.elements.favBandsContainer.innerHTML = `
        <div class="col-span-full p-12 text-center text-neutral-400 border border-dashed border-vault-800 rounded-3xl">
          <i data-lucide="users" class="w-10 h-10 text-neutral-600 mx-auto mb-2"></i>
          <p class="text-sm font-semibold text-neutral-300">No favorite bands yet</p>
          <p class="text-xs text-neutral-500 mt-0.5">Click "Favorite Band" on an artist page to add them here</p>
        </div>
      `;
    } else {
      this.elements.favBandsContainer.innerHTML = bands.map(b => `
        <div class="fav-band-card group cursor-pointer bg-vault-900 border border-vault-800 hover:border-vault-700 rounded-2xl p-3 flex flex-col items-center text-center transition-all" data-id="${b.id}">
          <div class="w-20 h-20 rounded-full overflow-hidden bg-vault-800 mb-2 border border-vault-700 shadow-md">
            <img src="${b.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
          </div>
          <h5 class="text-xs font-bold text-white group-hover:text-red-400 truncate w-full">${b.name}</h5>
          <p class="text-[11px] text-neutral-400 truncate">${b.genre || 'Artist'}</p>
        </div>
      `).join('');

      this.elements.favBandsContainer.querySelectorAll('.fav-band-card').forEach(card => {
        card.addEventListener('click', () => {
          const bId = card.getAttribute('data-id');
          const found = bands.find(b => b.id === bId);
          if (found) this.openArtist(found);
        });
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 4. ARTIST / DISCOGRAPHY VIEW =================
  async openArtist(band) {
    this.selectedBand = band;
    this.navigateTo('artist', { band }, true);
    this.updateFavBandButtonUI(storage.isFavoriteBand(band.id));

    if (!band.albums || band.albums.length === 0 || band.hasFullDiscography !== true) {
      this.elements.artistAlbumsList.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-center text-neutral-400">
          <i data-lucide="loader-2" class="w-8 h-8 text-red-500 animate-spin mb-3"></i>
          <p class="text-sm font-semibold text-neutral-200">Loading complete discography for ${band.name}...</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      const albums = await MusicAPI.getArtistDiscography(band.name, band.id);
      band.albums = albums;
      band.hasFullDiscography = true;

      if (albums.length > 0 && albums[0].cover && band.image.includes('unsplash')) {
        band.image = albums[0].cover;
      }

      storage.addCustomBand(band);
      this.renderArtistView();
    }
  }

  renderArtistView() {
    if (!this.selectedBand) return;

    const band = this.selectedBand;
    const bStats = VaultManager.getBandStats(band);

    let statusPill = `<span class="px-3 py-1 rounded-full bg-vault-800 border border-vault-700 text-neutral-400 text-xs">Locked (0% Listened)</span>`;
    if (bStats.status === 'mastered') {
      statusPill = `<span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20">
        <i data-lucide="crown" class="w-4 h-4 fill-current"></i> 100% Vault Mastered
      </span>`;
    } else if (bStats.status === 'in-progress') {
      statusPill = `<span class="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
        <i data-lucide="award" class="w-4 h-4"></i> ${bStats.percentage}% Completed
      </span>`;
    }

    this.elements.artistHeroCard.innerHTML = `
      <div class="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shrink-0 bg-vault-850 shadow-2xl border ${bStats.status === 'mastered' ? 'border-amber-400' : 'border-vault-700'}">
        <img src="${band.image}" alt="${band.name}" class="w-full h-full object-cover ${bStats.status === 'locked' ? 'grayscale opacity-75' : ''}">
      </div>

      <div class="flex-1 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          ${statusPill}
          <span class="text-xs text-neutral-400 px-3 py-1 rounded-full bg-vault-850 border border-vault-800">${band.genre || 'Artist'}</span>
        </div>

        <h2 class="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
          ${band.name}
        </h2>

        <p class="text-xs text-neutral-400 max-w-2xl leading-relaxed">
          ${band.bioSummary || 'Canonical discography ready for intentional listening in album order.'}
        </p>

        <div class="pt-2 max-w-md">
          <div class="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Overall Discography Completion:</span>
            <span class="font-bold font-mono text-white">${bStats.completedSongs} / ${bStats.totalSongs} songs (${bStats.percentage}%)</span>
          </div>
          <div class="w-full h-2 bg-vault-800 rounded-full overflow-hidden">
            <div class="${bStats.status === 'mastered' ? 'bg-amber-400' : 'bg-red-500'} h-full rounded-full transition-all duration-300" style="width: ${bStats.percentage}%"></div>
          </div>
        </div>
      </div>
    `;

    const albums = band.albums || [];
    this.elements.artistAlbumCount.textContent = `${albums.length} Releases`;

    this.elements.artistAlbumsList.innerHTML = albums.map(album => {
      const aStats = VaultManager.getAlbumStats(album);

      return `
        <div class="album-card group cursor-pointer bg-vault-900/90 hover:bg-vault-850 border border-vault-800 hover:border-vault-700 rounded-2xl p-4 transition-all flex flex-col justify-between" data-album-id="${album.id}">
          <div class="flex items-start gap-4">
            <div class="relative w-20 h-20 rounded-xl overflow-hidden bg-vault-800 shrink-0 border border-vault-700/80 shadow-md">
              <img src="${album.cover}" alt="${album.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
              ${aStats.isComplete ? `
                <div class="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div class="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-bold shadow">✓</div>
                </div>
              ` : ''}
            </div>

            <div class="min-w-0 flex-1">
              <span class="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-vault-800 border border-vault-700/60 inline-block mb-1">
                ${album.releaseYear}
              </span>
              <h4 class="font-display font-bold text-sm text-white group-hover:text-red-400 truncate">
                ${album.title}
              </h4>
              <p class="text-xs text-neutral-400 mt-0.5">
                ${album.trackCount || album.tracks?.length || 0} Tracks • ${album.genre || 'Album'}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-vault-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Completion:</span>
            <span class="font-mono ${aStats.isComplete ? 'text-amber-400 font-bold' : 'text-neutral-300'}">${aStats.percentage}%</span>
          </div>
        </div>
      `;
    }).join('');

    this.elements.artistAlbumsList.querySelectorAll('.album-card').forEach(card => {
      card.addEventListener('click', () => {
        const albumId = card.getAttribute('data-album-id');
        const found = albums.find(a => a.id === albumId);
        if (found) this.openAlbum(found);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  updateFavBandButtonUI(isFav) {
    if (isFav) {
      this.elements.favBandBtnText.textContent = 'Favorited Band ★';
      this.elements.btnFavBandToggle.classList.add('bg-amber-950/60', 'text-amber-300', 'border-amber-700/60');
    } else {
      this.elements.favBandBtnText.textContent = 'Favorite Band';
      this.elements.btnFavBandToggle.classList.remove('bg-amber-950/60', 'text-amber-300', 'border-amber-700/60');
    }
  }

  // ================= 5. ALBUM TRACKLIST VIEW (YT MUSIC STYLE) =================
  async openAlbum(album) {
    this.selectedAlbum = album;
    this.navigateTo('album', { album, band: this.selectedBand }, true);
    this.elements.backToArtistName.textContent = this.selectedBand?.name || album.artist || 'Artist';
    this.updateFavAlbumButtonUI(storage.isFavoriteAlbum(album.id));

    if (!album.tracks || album.tracks.length === 0) {
      this.elements.albumTracksTbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-neutral-400">
            <i data-lucide="loader-2" class="w-6 h-6 text-red-500 animate-spin mx-auto mb-2"></i>
            Loading complete tracklist in original order...
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();

      const tracks = await MusicAPI.getAlbumTracks(album.rawCollectionId, album.title, album.artist);
      album.tracks = tracks;
    }

    this.renderAlbumView();
  }

  renderAlbumView() {
    if (!this.selectedAlbum) return;

    const album = this.selectedAlbum;
    const tracks = album.tracks || [];
    const aStats = VaultManager.getAlbumStats(album);

    const totalMs = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
    const totalMinutes = Math.floor(totalMs / 60000);

    this.elements.albumHeaderContainer.innerHTML = `
      <div class="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden bg-vault-850 shrink-0 border border-vault-700 shadow-2xl">
        <img src="${album.cover}" alt="${album.title}" class="w-full h-full object-cover">
        ${aStats.isComplete ? `
          <div class="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow-lg">
            <i data-lucide="award" class="w-3.5 h-3.5"></i> Mastered
          </div>
        ` : ''}
      </div>

      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-2 text-xs text-neutral-400">
          <span class="uppercase tracking-wider font-semibold text-red-500">Album</span>
          <span>•</span>
          <span>${album.releaseYear}</span>
          <span>•</span>
          <span>${tracks.length} Songs</span>
          ${totalMinutes > 0 ? `<span>•</span><span>${totalMinutes} Minutes</span>` : ''}
        </div>

        <h2 class="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight">
          ${album.title}
        </h2>

        <p class="text-sm font-medium text-neutral-300">
          By <span class="text-white hover:underline cursor-pointer" id="album-header-artist-link">${album.artist}</span>
        </p>

        <div class="pt-2 flex items-center gap-4">
          <div class="px-3 py-1.5 rounded-full bg-vault-800 border border-vault-700 text-xs font-mono flex items-center gap-2">
            <span class="text-neutral-400">Album Completion:</span>
            <span class="font-bold ${aStats.isComplete ? 'text-amber-400' : 'text-emerald-400'}">${aStats.percentage}% (${aStats.completed}/${aStats.total})</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('album-header-artist-link')?.addEventListener('click', () => {
      window.history.back();
    });

    this.elements.albumTracksTbody.innerHTML = tracks.map((track, idx) => {
      const isCompleted = storage.isSongCompleted(track.id);
      const playCount = storage.getSongPlayCount(track.id);
      const isFav = storage.isFavoriteSong(track.id);
      const isCurrentPlaying = this.player.currentTrack?.id === track.id;

      return `
        <tr class="track-row group ${isCurrentPlaying ? 'active' : ''} cursor-pointer transition-colors" data-track-id="${track.id}" data-index="${idx}">
          <td class="py-3 px-4 text-center text-xs font-mono text-neutral-400 w-12 group-hover:text-white">
            <span class="track-index group-hover:hidden">${track.trackNumber || idx + 1}</span>
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current text-white hidden group-hover:inline-block mx-auto"></i>
          </td>

          <td class="py-3 px-4">
            <div class="font-medium text-sm text-neutral-200 group-hover:text-white truncate">
              ${track.title}
            </div>
            <div class="text-xs text-neutral-500 truncate">${track.artist}</div>
          </td>

          <td class="py-3 px-4 hidden sm:table-cell">
            ${isCompleted ? `
              <span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-semibold" title="90% listen completed">
                <i data-lucide="check" class="w-3 h-3"></i> Completed
              </span>
            ` : `
              <span class="text-[11px] text-neutral-500">Unlistened</span>
            `}
          </td>

          <td class="py-3 px-4 hidden md:table-cell text-right font-mono text-xs text-neutral-400">
            ${playCount > 0 ? `${playCount} ${playCount === 1 ? 'play' : 'plays'}` : '—'}
          </td>

          <td class="py-3 px-4 text-right font-mono text-xs text-neutral-400">
            ${track.formattedDuration || '—'}
          </td>

          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1">
              <button class="btn-row-like p-1.5 text-neutral-500 hover:text-red-500 transition-colors" data-track-id="${track.id}" title="Favorite">
                <i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}"></i>
              </button>
              <a href="https://music.youtube.com/search?q=${encodeURIComponent(track.artist + ' ' + track.title)}" target="_blank" rel="noopener noreferrer" class="p-1.5 text-neutral-500 hover:text-red-400 transition-colors" title="Listen on YouTube Music">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.elements.albumTracksTbody.querySelectorAll('.track-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-row-like') || e.target.closest('a')) return;
        const trackId = row.getAttribute('data-track-id');
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          this.player.playTrack(track, album, tracks);
        }
      });
    });

    this.elements.albumTracksTbody.querySelectorAll('.btn-row-like').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackId = btn.getAttribute('data-track-id');
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          const isFav = storage.toggleFavoriteSong(track);
          this.updatePlayerLikeIcon(isFav);
          this.updateFavoritesBadges();
          this.renderAlbumView();
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  updateFavAlbumButtonUI(isFav) {
    if (isFav) {
      this.elements.favAlbumBtnText.textContent = 'Favorited Album ❤️';
      this.elements.btnFavAlbumToggle.classList.add('bg-red-950/60', 'text-red-300', 'border-red-800/60');
    } else {
      this.elements.favAlbumBtnText.textContent = 'Favorite Album';
      this.elements.btnFavAlbumToggle.classList.remove('bg-red-950/60', 'text-red-300', 'border-red-800/60');
    }
  }

  // ================= 6. PLAYER EVENT HANDLERS =================
  handleTrackChange(track, album) {
    this.elements.playerTrackTitle.textContent = track.title;
    this.elements.playerTrackArtist.textContent = track.artist;
    this.elements.playerTrackAlbum.textContent = album?.title || 'Intentional Vault';
    if (album?.cover || track.cover) {
      this.elements.playerTrackArt.src = album?.cover || track.cover;
    }

    const isCompleted = storage.isSongCompleted(track.id);
    if (isCompleted) {
      this.elements.playerTrackCompletedBadge.classList.remove('hidden');
    } else {
      this.elements.playerTrackCompletedBadge.classList.add('hidden');
    }

    const isFav = storage.isFavoriteSong(track.id);
    this.updatePlayerLikeIcon(isFav);

    // Update Direct YouTube Music Link
    this.elements.btnPlayerYtm.href = this.player.getYoutubeMusicUrl();

    this.elements.playerCompletionPct.textContent = '0%';
    this.elements.playerProgressFill.style.width = '0%';

    if (this.currentView === 'album') {
      this.renderAlbumView();
    }
  }

  handlePlayStateChange(isPlaying) {
    if (isPlaying) {
      this.elements.playerPlayIcon.setAttribute('data-lucide', 'pause');
    } else {
      this.elements.playerPlayIcon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  handleProgressUpdate({ formattedCurrent, formattedDuration, ratio, percentage }) {
    this.elements.playerCurrentTime.textContent = formattedCurrent;
    this.elements.playerDuration.textContent = formattedDuration;
    this.elements.playerProgressFill.style.width = `${Math.min(100, ratio * 100)}%`;
    this.elements.playerCompletionPct.textContent = `${percentage}%`;
  }

  handleSongCompleted(track, album) {
    this.elements.playerTrackCompletedBadge.classList.remove('hidden');
    this.showToast(`🏆 90% Completed: "${track.title}" logged in Vault!`, 'success');

    if (album) {
      const aStats = VaultManager.getAlbumStats(album);
      if (aStats.isComplete) {
        this.showToast(`🌟 ALBUM MASTERED: ${album.title}!`, 'achievement');
      }
    }

    if (this.selectedBand) {
      const bStats = VaultManager.getBandStats(this.selectedBand);
      if (bStats.status === 'mastered') {
        this.showToast(`👑 BAND MASTERED: ${this.selectedBand.name} unlocked full color & golden aura!`, 'achievement');
      }
    }

    if (this.currentView === 'album') {
      this.renderAlbumView();
    } else if (this.currentView === 'artist') {
      this.renderArtistView();
    } else if (this.currentView === 'vault') {
      this.renderVault();
    }
  }

  updatePlayerLikeIcon(isFav) {
    const icon = this.elements.btnPlayerLike.querySelector('svg') || this.elements.btnPlayerLike.querySelector('i');
    if (isFav) {
      this.elements.btnPlayerLike.classList.add('text-red-500');
      this.elements.btnPlayerLike.classList.remove('text-neutral-400');
    } else {
      this.elements.btnPlayerLike.classList.remove('text-red-500');
      this.elements.btnPlayerLike.classList.add('text-neutral-400');
    }
  }

  updateTrackTableStatus(trackId) {
    const row = this.elements.albumTracksTbody.querySelector(`tr[data-track-id="${trackId}"]`);
    if (row) {
      const likeBtn = row.querySelector('.btn-row-like');
      if (likeBtn) {
        const isFav = storage.isFavoriteSong(trackId);
        likeBtn.innerHTML = `<i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // ================= 7. ARTIST BIO MODAL =================
  async openArtistBioModal() {
    if (!this.selectedBand) return;

    this.elements.modalArtistBio.classList.remove('hidden');
    this.elements.modalArtistBio.classList.add('flex');
    this.elements.bioModalTitle.textContent = `${this.selectedBand.name} — Credits & Bio`;
    this.elements.bioModalExtract.textContent = 'Loading Wikipedia overview...';
    this.elements.bioModalMembers.innerHTML = `<span class="text-xs text-neutral-500">Loading members...</span>`;

    const bio = await MusicAPI.getArtistBio(this.selectedBand.name);

    this.elements.bioModalExtract.textContent = bio.extract;

    this.elements.bioModalMembers.innerHTML = bio.members.map(m => `
      <span class="px-2.5 py-1 rounded-lg bg-vault-800 border border-vault-700 text-xs text-neutral-200 font-medium">
        ${m}
      </span>
    `).join('');

    this.elements.bioModalExtLink.innerHTML = `
      <a href="${bio.wikiUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors">
        Read full Wikipedia entry <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
      </a>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 8. TOAST NOTIFICATIONS =================
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    let border = 'border-vault-700';
    let bg = 'bg-vault-900/95';
    let icon = 'info';
    let textColor = 'text-neutral-200';

    if (type === 'success') {
      border = 'border-emerald-500/60';
      textColor = 'text-emerald-300';
      icon = 'check-circle';
    } else if (type === 'achievement') {
      border = 'border-amber-400';
      bg = 'bg-vault-900/95 shadow-amber-500/20';
      textColor = 'text-amber-300';
      icon = 'award';
    } else if (type === 'error') {
      border = 'border-red-500';
      textColor = 'text-red-300';
      icon = 'alert-circle';
    }

    toast.className = `animate-toast flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${bg} border ${border} shadow-2xl backdrop-blur-md text-xs font-medium ${textColor} max-w-sm pointer-events-auto`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>
      <span class="flex-1">${message}</span>
    `;

    this.elements.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
