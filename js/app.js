/**
 * Intentional Music — Main Application Controller
 * Includes:
 *  - Full Browser History API integration (Browser Back / Forward / Android gestures)
 *  - On-screen YouTube Music & Spotify style Back & Forward buttons
 *  - Dynamic full-discography loading for every band
 *  - Steam-style completion mathematics & achievements
 */

import { storage } from './storage.js';
import { MusicAPI } from './api.js';
import { VaultManager } from './vault.js';
import { DisguisedPlayer } from './player.js';

class App {
  constructor() {
    this.currentView = 'vault'; // 'vault' | 'artist' | 'album'
    this.selectedBand = null;
    this.selectedAlbum = null;
    this.searchMode = 'curated'; // 'curated' | 'unfiltered'
    this.activeGenre = 'all';
    this.activeCompletionFilter = 'all';

    // Player instance
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
  }

  initDOM() {
    if (window.lucide) window.lucide.createIcons();

    this.elements = {
      // Top Navigation & History
      navBrand: document.getElementById('nav-brand'),
      navHistoryBack: document.getElementById('nav-history-back'),
      navHistoryForward: document.getElementById('nav-history-forward'),

      // Views
      viewVault: document.getElementById('view-vault'),
      viewArtist: document.getElementById('view-artist'),
      viewAlbum: document.getElementById('view-album'),

      // Search
      searchInput: document.getElementById('global-search-input'),
      searchModeToggle: document.getElementById('search-mode-toggle'),
      searchModeLabel: document.getElementById('search-mode-label'),
      searchModeIndicator: document.getElementById('search-mode-indicator'),
      searchDropdown: document.getElementById('search-results-dropdown'),

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
      btnArtistInfo: document.getElementById('btn-artist-info'),

      // Album View
      albumHeaderContainer: document.getElementById('album-header-container'),
      albumTracksTbody: document.getElementById('album-tracks-tbody'),
      btnBackToArtist: document.getElementById('btn-back-to-artist'),
      backToArtistName: document.getElementById('back-to-artist-name'),
      btnPlayFullAlbum: document.getElementById('btn-play-full-album'),

      // Disguised Player Bar
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

      // Modals
      modalArtistBio: document.getElementById('modal-artist-bio'),
      bioModalTitle: document.getElementById('bio-modal-title'),
      bioModalMembers: document.getElementById('bio-modal-members'),
      bioModalExtract: document.getElementById('bio-modal-extract'),
      bioModalExtLink: document.getElementById('bio-modal-ext-link'),
      btnCloseBioModal: document.getElementById('btn-close-bio-modal'),

      modalSettings: document.getElementById('modal-settings'),
      btnSettings: document.getElementById('btn-settings'),
      btnCloseSettings: document.getElementById('btn-close-settings'),
      settingsFirebaseConfig: document.getElementById('settings-firebase-config'),
      btnSaveSettings: document.getElementById('btn-save-settings'),
      btnResetStorage: document.getElementById('btn-reset-storage'),

      toastContainer: document.getElementById('toast-container')
    };
  }

  // ================= BROWSER HISTORY & BACK / FORWARD NAVIGATION =================
  initHistory() {
    // Set initial state
    history.replaceState({ view: 'vault' }, '', window.location.pathname + '#/vault');

    // Listen to browser Back and Forward events (and Android back button/swipe)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.navigateTo(e.state.view, e.state, false);
      } else {
        this.navigateTo('vault', {}, false);
      }
    });

    // Keyboard shortcuts (Alt+Left for Back, Alt+Right for Forward)
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
    this.elements.viewArtist.classList.add('hidden');
    this.elements.viewAlbum.classList.add('hidden');

    if (view === 'vault') {
      this.selectedBand = null;
      this.selectedAlbum = null;
      this.elements.viewVault.classList.remove('hidden');
      this.renderVault();
      if (pushHistory) {
        history.pushState({ view: 'vault' }, '', window.location.pathname + '#/vault');
      }
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
    // Nav Brand -> Return to Vault
    this.elements.navBrand.addEventListener('click', () => this.navigateTo('vault'));

    // On-Screen Back & Forward Buttons
    this.elements.navHistoryBack.addEventListener('click', () => window.history.back());
    this.elements.navHistoryForward.addEventListener('click', () => window.history.forward());

    // In-page Back Buttons
    this.elements.btnBackToVault.addEventListener('click', () => window.history.back());
    this.elements.btnBackToArtist.addEventListener('click', () => window.history.back());

    // Search Toggle Mode
    this.elements.searchModeToggle.addEventListener('click', () => {
      if (this.searchMode === 'curated') {
        this.searchMode = 'unfiltered';
        this.elements.searchModeLabel.textContent = 'Unfiltered YT';
        this.elements.searchModeIndicator.className = 'w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse';
        this.elements.searchInput.placeholder = 'Search small/indie artists or custom tracks via YouTube...';
        this.showToast('Switched to Unfiltered YouTube Search mode', 'info');
      } else {
        this.searchMode = 'curated';
        this.elements.searchModeLabel.textContent = 'Curated';
        this.elements.searchModeIndicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
        this.elements.searchInput.placeholder = 'Search any band or artist...';
        this.showToast('Switched to Curated Discography mode', 'info');
      }
      this.handleSearchInput();
    });

    // Search Input with debounce
    let searchDebounceTimer = null;
    this.elements.searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => this.handleSearchInput(), 300);
    });

    document.addEventListener('click', (e) => {
      if (!this.elements.searchInput.contains(e.target) && !this.elements.searchDropdown.contains(e.target)) {
        this.elements.searchDropdown.classList.add('hidden');
      }
    });

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

    // Completion Filter
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

    // Settings Modal
    this.elements.btnSettings.addEventListener('click', () => {
      this.elements.modalSettings.classList.remove('hidden');
      this.elements.modalSettings.classList.add('flex');
    });
    this.elements.btnCloseSettings.addEventListener('click', () => {
      this.elements.modalSettings.classList.add('hidden');
      this.elements.modalSettings.classList.remove('flex');
    });
    this.elements.btnSaveSettings.addEventListener('click', () => {
      try {
        const confStr = this.elements.settingsFirebaseConfig.value.trim();
        if (confStr) {
          const parsed = JSON.parse(confStr);
          storage.data.settings.firebaseConfig = parsed;
          storage.saveLocal();
          this.showToast('Settings saved. Connecting Firebase...', 'success');
        }
      } catch (e) {
        this.showToast('Invalid JSON in Firebase configuration', 'error');
      }
      this.elements.modalSettings.classList.add('hidden');
    });
    this.elements.btnResetStorage.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your vault progress and unlocked achievements?')) {
        storage.resetAll();
        this.renderVault();
        this.showToast('Vault data reset.', 'info');
        this.elements.modalSettings.classList.add('hidden');
      }
    });

    // Player Controls
    this.elements.btnPlayerPlayToggle.addEventListener('click', () => {
      if (!this.player.currentTrack) {
        // If nothing is playing yet, play the first track of currently viewed album
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
      const liked = storage.toggleLike(this.player.currentTrack.id);
      this.updatePlayerLikeIcon(liked);
      this.showToast(liked ? 'Added to Liked Songs' : 'Removed from Liked Songs', 'info');
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

  // ================= 2. ARTIST / DISCOGRAPHY VIEW =================
  async openArtist(band) {
    this.selectedBand = band;
    this.navigateTo('artist', { band }, true);

    // Fetch full canonical discography dynamically if not already cached
    if (!band.albums || band.albums.length === 0 || band.hasFullDiscography !== true) {
      this.elements.artistAlbumsList.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-center text-neutral-400">
          <i data-lucide="loader-2" class="w-8 h-8 text-red-500 animate-spin mb-3"></i>
          <p class="text-sm font-semibold text-neutral-200">Loading complete discography for ${band.name}...</p>
          <p class="text-xs text-neutral-500 mt-1">Filtering out compilation spam to show original studio albums</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      const albums = await MusicAPI.getArtistDiscography(band.name, band.id);
      band.albums = albums;
      band.hasFullDiscography = true;

      // Update image from first album if generic
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

    if (albums.length === 0) {
      this.elements.artistAlbumsList.innerHTML = `
        <div class="col-span-full py-12 text-center text-neutral-400">
          <p class="text-sm">No albums loaded yet. Click to fetch releases.</p>
        </div>
      `;
      return;
    }

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
        if (found) {
          this.openAlbum(found);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 3. ALBUM TRACKLIST VIEW (YT MUSIC STYLE) =================
  async openAlbum(album) {
    this.selectedAlbum = album;
    this.navigateTo('album', { album, band: this.selectedBand }, true);
    this.elements.backToArtistName.textContent = this.selectedBand?.name || 'Artist';

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
      const isLiked = storage.isLiked(track.id);
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
            <button class="btn-row-like p-1.5 text-neutral-500 hover:text-red-500 transition-colors" data-track-id="${track.id}">
              <i data-lucide="heart" class="w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.elements.albumTracksTbody.querySelectorAll('.track-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-row-like')) return;
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
        const liked = storage.toggleLike(trackId);
        this.updatePlayerLikeIcon(liked);
        this.renderAlbumView();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 4. PLAYER EVENT HANDLERS =================
  handleTrackChange(track, album) {
    this.elements.playerTrackTitle.textContent = track.title;
    this.elements.playerTrackArtist.textContent = track.artist;
    this.elements.playerTrackAlbum.textContent = album?.title || 'Intentional Vault';
    if (album?.cover) {
      this.elements.playerTrackArt.src = album.cover;
    }

    const isCompleted = storage.isSongCompleted(track.id);
    if (isCompleted) {
      this.elements.playerTrackCompletedBadge.classList.remove('hidden');
    } else {
      this.elements.playerTrackCompletedBadge.classList.add('hidden');
    }

    const liked = storage.isLiked(track.id);
    this.updatePlayerLikeIcon(liked);

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

  updatePlayerLikeIcon(isLiked) {
    const icon = this.elements.btnPlayerLike.querySelector('svg') || this.elements.btnPlayerLike.querySelector('i');
    if (isLiked) {
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
        const isLiked = storage.isLiked(trackId);
        likeBtn.innerHTML = `<i data-lucide="heart" class="w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  // ================= 5. SEARCH & DISCOVERY =================
  async handleSearchInput() {
    const query = this.elements.searchInput.value.trim();
    if (query.length < 2) {
      this.elements.searchDropdown.classList.add('hidden');
      return;
    }

    this.elements.searchDropdown.classList.remove('hidden');
    this.elements.searchDropdown.innerHTML = `
      <div class="p-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <i data-lucide="loader-2" class="w-4 h-4 text-red-500 animate-spin"></i>
        Searching ${this.searchMode === 'curated' ? 'curated discographies' : 'unfiltered YouTube'}...
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    let results = [];
    if (this.searchMode === 'curated') {
      results = await MusicAPI.searchCurated(query);
    } else {
      results = await MusicAPI.searchUnfilteredYouTube(query);
    }

    if (results.length === 0) {
      this.elements.searchDropdown.innerHTML = `
        <div class="p-4 text-center text-xs text-neutral-400">
          No artists found. Try switching to <b>Unfiltered YouTube</b> mode at the top right of the search bar!
        </div>
      `;
      return;
    }

    this.elements.searchDropdown.innerHTML = results.slice(0, 6).map(artist => `
      <div class="search-result-item p-3 hover:bg-vault-800 cursor-pointer flex items-center justify-between transition-colors" data-name="${encodeURIComponent(artist.name)}" data-id="${artist.id}">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-vault-800 shrink-0 border border-vault-700">
            <img src="${artist.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120'}" class="w-full h-full object-cover">
          </div>
          <div class="min-w-0">
            <h5 class="text-sm font-semibold text-white truncate">${artist.name}</h5>
            <p class="text-xs text-neutral-400 truncate">${artist.genre || 'Artist'} • ${artist.albumCount || 1} Albums</p>
          </div>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full bg-red-950/60 text-red-400 border border-red-800/40 font-medium shrink-0">
          Add to Vault
        </span>
      </div>
    `).join('');

    this.elements.searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', async () => {
        const artistName = decodeURIComponent(item.getAttribute('data-name'));
        const artistObj = results.find(r => r.name === artistName);

        this.elements.searchDropdown.classList.add('hidden');
        this.elements.searchInput.value = '';

        if (artistObj) {
          storage.addCustomBand(artistObj);
          this.showToast(`Added "${artistObj.name}" to your Intentional Vault!`, 'success');
          this.openArtist(artistObj);
        }
      });
    });
  }

  // ================= 6. BAND BIO & MEMBERS MODAL =================
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

  // ================= 7. TOAST NOTIFICATIONS =================
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
