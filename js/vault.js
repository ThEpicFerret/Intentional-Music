/**
 * Intentional Music — Vault & Gamification Core
 * Manages:
 *  - Preloaded starter bands with curated albums & tracks
 *  - Steam-style completion mathematics (90% listen requirement)
 *  - Achievement tiers: Locked (0%), In-Progress (>0%), Mastered (100% Gold)
 */

import { storage } from './storage.js';

export const STARTER_BANDS = [
  {
    id: 'starter_pink_floyd',
    name: 'Pink Floyd',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    bioSummary: 'Iconic English rock band formed in London in 1965, pioneers of progressive and psychedelic rock.',
    albums: [
      {
        id: 'pf_dsotm',
        rawCollectionId: 'pf_dsotm',
        title: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        releaseYear: 1973,
        trackCount: 10,
        genre: 'Progressive Rock',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        tracks: [
          { id: 'pf_01', trackNumber: 1, title: 'Speak to Me', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 67000, formattedDuration: '1:07', youtubeSearchQuery: 'Pink Floyd Speak to Me official audio' },
          { id: 'pf_02', trackNumber: 2, title: 'Breathe (In the Air)', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 169000, formattedDuration: '2:49', youtubeSearchQuery: 'Pink Floyd Breathe In the Air official audio' },
          { id: 'pf_03', trackNumber: 3, title: 'On the Run', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 225000, formattedDuration: '3:45', youtubeSearchQuery: 'Pink Floyd On the Run official audio' },
          { id: 'pf_04', trackNumber: 4, title: 'Time', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 413000, formattedDuration: '6:53', youtubeSearchQuery: 'Pink Floyd Time official audio' },
          { id: 'pf_05', trackNumber: 5, title: 'The Great Gig in the Sky', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 284000, formattedDuration: '4:44', youtubeSearchQuery: 'Pink Floyd The Great Gig in the Sky official audio' },
          { id: 'pf_06', trackNumber: 6, title: 'Money', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 382000, formattedDuration: '6:22', youtubeSearchQuery: 'Pink Floyd Money official audio' },
          { id: 'pf_07', trackNumber: 7, title: 'Us and Them', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 470000, formattedDuration: '7:50', youtubeSearchQuery: 'Pink Floyd Us and Them official audio' },
          { id: 'pf_08', trackNumber: 8, title: 'Any Colour You Like', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 205000, formattedDuration: '3:25', youtubeSearchQuery: 'Pink Floyd Any Colour You Like official audio' },
          { id: 'pf_09', trackNumber: 9, title: 'Brain Damage', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 228000, formattedDuration: '3:48', youtubeSearchQuery: 'Pink Floyd Brain Damage official audio' },
          { id: 'pf_10', trackNumber: 10, title: 'Eclipse', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', durationMs: 123000, formattedDuration: '2:03', youtubeSearchQuery: 'Pink Floyd Eclipse official audio' }
        ]
      },
      {
        id: 'pf_wywh',
        rawCollectionId: 'pf_wywh',
        title: 'Wish You Were Here',
        artist: 'Pink Floyd',
        releaseYear: 1975,
        trackCount: 5,
        genre: 'Progressive Rock',
        cover: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600',
        tracks: [
          { id: 'pf_w01', trackNumber: 1, title: 'Shine On You Crazy Diamond (Pts. 1-5)', artist: 'Pink Floyd', album: 'Wish You Were Here', durationMs: 810000, formattedDuration: '13:30', youtubeSearchQuery: 'Pink Floyd Shine On You Crazy Diamond Pts 1-5 official audio' },
          { id: 'pf_w02', trackNumber: 2, title: 'Welcome to the Machine', artist: 'Pink Floyd', album: 'Wish You Were Here', durationMs: 451000, formattedDuration: '7:31', youtubeSearchQuery: 'Pink Floyd Welcome to the Machine official audio' },
          { id: 'pf_w03', trackNumber: 3, title: 'Have a Cigar', artist: 'Pink Floyd', album: 'Wish You Were Here', durationMs: 308000, formattedDuration: '5:08', youtubeSearchQuery: 'Pink Floyd Have a Cigar official audio' },
          { id: 'pf_w04', trackNumber: 4, title: 'Wish You Were Here', artist: 'Pink Floyd', album: 'Wish You Were Here', durationMs: 334000, formattedDuration: '5:34', youtubeSearchQuery: 'Pink Floyd Wish You Were Here official audio' },
          { id: 'pf_w05', trackNumber: 5, title: 'Shine On You Crazy Diamond (Pts. 6-9)', artist: 'Pink Floyd', album: 'Wish You Were Here', durationMs: 751000, formattedDuration: '12:31', youtubeSearchQuery: 'Pink Floyd Shine On You Crazy Diamond Pts 6-9 official audio' }
        ]
      }
    ]
  },
  {
    id: 'starter_avenged_sevenfold',
    name: 'Avenged Sevenfold',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600',
    bioSummary: 'American heavy metal band from Huntington Beach, California, formed in 1999.',
    albums: [
      {
        id: 'a7x_lbc',
        rawCollectionId: 'a7x_lbc',
        title: 'Live in the LBC & Diamonds in the Rough',
        artist: 'Avenged Sevenfold',
        releaseYear: 2008,
        trackCount: 6,
        genre: 'Heavy Metal (Live)',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
        tracks: [
          { id: 'a7x_01', trackNumber: 1, title: 'Critical Acclaim (Live)', artist: 'Avenged Sevenfold', album: 'Live in the LBC', durationMs: 366000, formattedDuration: '6:06', youtubeSearchQuery: 'Avenged Sevenfold Critical Acclaim Live in the LBC official audio' },
          { id: 'a7x_02', trackNumber: 2, title: 'Second Heartbeat (Live)', artist: 'Avenged Sevenfold', album: 'Live in the LBC', durationMs: 423000, formattedDuration: '7:03', youtubeSearchQuery: 'Avenged Sevenfold Second Heartbeat Live in the LBC official audio' },
          { id: 'a7x_03', trackNumber: 3, title: 'Afterlife (Live)', artist: 'Avenged Sevenfold', album: 'Live in the LBC', durationMs: 365000, formattedDuration: '6:05', youtubeSearchQuery: 'Avenged Sevenfold Afterlife Live in the LBC official audio' },
          { id: 'a7x_04', trackNumber: 4, title: 'Bat Country (Live)', artist: 'Avenged Sevenfold', album: 'Live in the LBC', durationMs: 361000, formattedDuration: '6:01', youtubeSearchQuery: 'Avenged Sevenfold Bat Country Live in the LBC official audio' },
          { id: 'a7x_05', trackNumber: 5, title: 'Almost Easy (Live)', artist: 'Avenged Sevenfold', album: 'Live in the LBC', durationMs: 234000, formattedDuration: '3:54', youtubeSearchQuery: 'Avenged Sevenfold Almost Easy Live in the LBC official audio' },
          { id: 'a7x_06', trackNumber: 6, title: 'A Little Piece of Heaven (Live)', artist: 'Avenged Sevenfold', album: 'Live in the LBC', durationMs: 504000, formattedDuration: '8:24', youtubeSearchQuery: 'Avenged Sevenfold A Little Piece of Heaven Live in the LBC official audio' }
        ]
      },
      {
        id: 'a7x_city_of_evil',
        rawCollectionId: 'a7x_city_of_evil',
        title: 'City of Evil',
        artist: 'Avenged Sevenfold',
        releaseYear: 2005,
        trackCount: 5,
        genre: 'Heavy Metal',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
        tracks: [
          { id: 'a7x_c01', trackNumber: 1, title: 'Beast and the Harlot', artist: 'Avenged Sevenfold', album: 'City of Evil', durationMs: 342000, formattedDuration: '5:42', youtubeSearchQuery: 'Avenged Sevenfold Beast and the Harlot official audio' },
          { id: 'a7x_c02', trackNumber: 2, title: 'Bat Country', artist: 'Avenged Sevenfold', album: 'City of Evil', durationMs: 313000, formattedDuration: '5:13', youtubeSearchQuery: 'Avenged Sevenfold Bat Country official audio' },
          { id: 'a7x_c03', trackNumber: 3, title: 'Trashed and Scattered', artist: 'Avenged Sevenfold', album: 'City of Evil', durationMs: 355000, formattedDuration: '5:55', youtubeSearchQuery: 'Avenged Sevenfold Trashed and Scattered official audio' },
          { id: 'a7x_c04', trackNumber: 4, title: 'Seize the Day', artist: 'Avenged Sevenfold', album: 'City of Evil', durationMs: 332000, formattedDuration: '5:32', youtubeSearchQuery: 'Avenged Sevenfold Seize the Day official audio' },
          { id: 'a7x_c05', trackNumber: 5, title: 'M.I.A.', artist: 'Avenged Sevenfold', album: 'City of Evil', durationMs: 526000, formattedDuration: '8:46', youtubeSearchQuery: 'Avenged Sevenfold MIA official audio' }
        ]
      }
    ]
  },
  {
    id: 'starter_daft_punk',
    name: 'Daft Punk',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    bioSummary: 'French electronic music duo formed in 1993 in Paris by Thomas Bangalter and Guy-Manuel de Homem-Christo.',
    albums: [
      {
        id: 'dp_discovery',
        rawCollectionId: 'dp_discovery',
        title: 'Discovery',
        artist: 'Daft Punk',
        releaseYear: 2001,
        trackCount: 6,
        genre: 'French House',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        tracks: [
          { id: 'dp_01', trackNumber: 1, title: 'One More Time', artist: 'Daft Punk', album: 'Discovery', durationMs: 320000, formattedDuration: '5:20', youtubeSearchQuery: 'Daft Punk One More Time official audio' },
          { id: 'dp_02', trackNumber: 2, title: 'Aerodynamic', artist: 'Daft Punk', album: 'Discovery', durationMs: 207000, formattedDuration: '3:27', youtubeSearchQuery: 'Daft Punk Aerodynamic official audio' },
          { id: 'dp_03', trackNumber: 3, title: 'Digital Love', artist: 'Daft Punk', album: 'Discovery', durationMs: 298000, formattedDuration: '4:58', youtubeSearchQuery: 'Daft Punk Digital Love official audio' },
          { id: 'dp_04', trackNumber: 4, title: 'Harder, Better, Faster, Stronger', artist: 'Daft Punk', album: 'Discovery', durationMs: 224000, formattedDuration: '3:44', youtubeSearchQuery: 'Daft Punk Harder Better Faster Stronger official audio' },
          { id: 'dp_05', trackNumber: 5, title: 'Crescendolls', artist: 'Daft Punk', album: 'Discovery', durationMs: 211000, formattedDuration: '3:31', youtubeSearchQuery: 'Daft Punk Crescendolls official audio' },
          { id: 'dp_06', trackNumber: 6, title: 'Something About Us', artist: 'Daft Punk', album: 'Discovery', durationMs: 231000, formattedDuration: '3:51', youtubeSearchQuery: 'Daft Punk Something About Us official audio' }
        ]
      },
      {
        id: 'dp_ram',
        rawCollectionId: 'dp_ram',
        title: 'Random Access Memories',
        artist: 'Daft Punk',
        releaseYear: 2013,
        trackCount: 5,
        genre: 'Disco / Funk',
        cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
        tracks: [
          { id: 'dp_r01', trackNumber: 1, title: 'Give Life Back to Music', artist: 'Daft Punk', album: 'Random Access Memories', durationMs: 274000, formattedDuration: '4:34', youtubeSearchQuery: 'Daft Punk Give Life Back to Music official audio' },
          { id: 'dp_r02', trackNumber: 2, title: 'Giorgio by Moroder', artist: 'Daft Punk', album: 'Random Access Memories', durationMs: 544000, formattedDuration: '9:04', youtubeSearchQuery: 'Daft Punk Giorgio by Moroder official audio' },
          { id: 'dp_r03', trackNumber: 3, title: 'Instant Crush (feat. Julian Casablancas)', artist: 'Daft Punk', album: 'Random Access Memories', durationMs: 337000, formattedDuration: '5:37', youtubeSearchQuery: 'Daft Punk Instant Crush official audio' },
          { id: 'dp_r04', trackNumber: 4, title: 'Lose Yourself to Dance (feat. Pharrell Williams)', artist: 'Daft Punk', album: 'Random Access Memories', durationMs: 353000, formattedDuration: '5:53', youtubeSearchQuery: 'Daft Punk Lose Yourself to Dance official audio' },
          { id: 'dp_r05', trackNumber: 5, title: 'Get Lucky (feat. Pharrell Williams)', artist: 'Daft Punk', album: 'Random Access Memories', durationMs: 369000, formattedDuration: '6:09', youtubeSearchQuery: 'Daft Punk Get Lucky official audio' }
        ]
      }
    ]
  },
  {
    id: 'starter_radiohead',
    name: 'Radiohead',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600',
    bioSummary: 'English rock band formed in Abingdon, Oxfordshire, in 1985.',
    albums: [
      {
        id: 'rh_okc',
        rawCollectionId: 'rh_okc',
        title: 'OK Computer',
        artist: 'Radiohead',
        releaseYear: 1997,
        trackCount: 6,
        genre: 'Alternative Rock',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        tracks: [
          { id: 'rh_01', trackNumber: 1, title: 'Airbag', artist: 'Radiohead', album: 'OK Computer', durationMs: 284000, formattedDuration: '4:44', youtubeSearchQuery: 'Radiohead Airbag official audio' },
          { id: 'rh_02', trackNumber: 2, title: 'Paranoid Android', artist: 'Radiohead', album: 'OK Computer', durationMs: 383000, formattedDuration: '6:23', youtubeSearchQuery: 'Radiohead Paranoid Android official audio' },
          { id: 'rh_03', trackNumber: 3, title: 'Subterranean Homesick Alien', artist: 'Radiohead', album: 'OK Computer', durationMs: 267000, formattedDuration: '4:27', youtubeSearchQuery: 'Radiohead Subterranean Homesick Alien official audio' },
          { id: 'rh_04', trackNumber: 4, title: 'Exit Music (For a Film)', artist: 'Radiohead', album: 'OK Computer', durationMs: 264000, formattedDuration: '4:24', youtubeSearchQuery: 'Radiohead Exit Music For a Film official audio' },
          { id: 'rh_05', trackNumber: 5, title: 'Karma Police', artist: 'Radiohead', album: 'OK Computer', durationMs: 261000, formattedDuration: '4:21', youtubeSearchQuery: 'Radiohead Karma Police official audio' },
          { id: 'rh_06', trackNumber: 6, title: 'No Surprises', artist: 'Radiohead', album: 'OK Computer', durationMs: 228000, formattedDuration: '3:48', youtubeSearchQuery: 'Radiohead No Surprises official audio' }
        ]
      }
    ]
  },
  {
    id: 'starter_kendrick',
    name: 'Kendrick Lamar',
    genre: 'Hip Hop',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    bioSummary: 'American rapper, songwriter, and producer regarded as one of the most influential hip hop artists of his generation.',
    albums: [
      {
        id: 'kl_gkmc',
        rawCollectionId: 'kl_gkmc',
        title: 'Good Kid, M.A.A.D City',
        artist: 'Kendrick Lamar',
        releaseYear: 2012,
        trackCount: 5,
        genre: 'Hip Hop',
        cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        tracks: [
          { id: 'kl_01', trackNumber: 1, title: 'Sherane a.k.a Master Splinter’s Daughter', artist: 'Kendrick Lamar', album: 'Good Kid, M.A.A.D City', durationMs: 273000, formattedDuration: '4:33', youtubeSearchQuery: 'Kendrick Lamar Sherane official audio' },
          { id: 'kl_02', trackNumber: 2, title: 'Bitch, Don’t Kill My Vibe', artist: 'Kendrick Lamar', album: 'Good Kid, M.A.A.D City', durationMs: 310000, formattedDuration: '5:10', youtubeSearchQuery: 'Kendrick Lamar Bitch Don’t Kill My Vibe official audio' },
          { id: 'kl_03', trackNumber: 3, title: 'Backseat Freestyle', artist: 'Kendrick Lamar', album: 'Good Kid, M.A.A.D City', durationMs: 212000, formattedDuration: '3:32', youtubeSearchQuery: 'Kendrick Lamar Backseat Freestyle official audio' },
          { id: 'kl_04', trackNumber: 4, title: 'Money Trees (feat. Jay Rock)', artist: 'Kendrick Lamar', album: 'Good Kid, M.A.A.D City', durationMs: 386000, formattedDuration: '6:26', youtubeSearchQuery: 'Kendrick Lamar Money Trees official audio' },
          { id: 'kl_05', trackNumber: 5, title: 'm.A.A.d city (feat. MC Eiht)', artist: 'Kendrick Lamar', album: 'Good Kid, M.A.A.D City', durationMs: 350000, formattedDuration: '5:50', youtubeSearchQuery: 'Kendrick Lamar mAAd city official audio' }
        ]
      }
    ]
  },
  {
    id: 'starter_miles_davis',
    name: 'Miles Davis',
    genre: 'Jazz',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    bioSummary: 'American trumpeter, bandleader, and composer among the most influential and acclaimed figures in the history of jazz.',
    albums: [
      {
        id: 'md_kind_of_blue',
        rawCollectionId: 'md_kind_of_blue',
        title: 'Kind of Blue',
        artist: 'Miles Davis',
        releaseYear: 1959,
        trackCount: 5,
        genre: 'Modal Jazz',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        tracks: [
          { id: 'md_01', trackNumber: 1, title: 'So What', artist: 'Miles Davis', album: 'Kind of Blue', durationMs: 562000, formattedDuration: '9:22', youtubeSearchQuery: 'Miles Davis So What official audio' },
          { id: 'md_02', trackNumber: 2, title: 'Freddie Freeloader', artist: 'Miles Davis', album: 'Kind of Blue', durationMs: 586000, formattedDuration: '9:46', youtubeSearchQuery: 'Miles Davis Freddie Freeloader official audio' },
          { id: 'md_03', trackNumber: 3, title: 'Blue in Green', artist: 'Miles Davis', album: 'Kind of Blue', durationMs: 337000, formattedDuration: '5:37', youtubeSearchQuery: 'Miles Davis Blue in Green official audio' },
          { id: 'md_04', trackNumber: 4, title: 'All Blues', artist: 'Miles Davis', album: 'Kind of Blue', durationMs: 693000, formattedDuration: '11:33', youtubeSearchQuery: 'Miles Davis All Blues official audio' },
          { id: 'md_05', trackNumber: 5, title: 'Flamenco Sketches', artist: 'Miles Davis', album: 'Kind of Blue', durationMs: 566000, formattedDuration: '9:26', youtubeSearchQuery: 'Miles Davis Flamenco Sketches official audio' }
        ]
      }
    ]
  }
];

export class VaultManager {
  /**
   * Get all bands (starter bands + custom user-added bands)
   */
  static getAllBands() {
    const custom = storage.getCustomBands();
    return [...STARTER_BANDS, ...custom];
  }

  /**
   * Calculate completion rate for a band
   * Based strictly on songs listened to at >= 90% duration
   */
  static getBandStats(band) {
    if (!band || !band.albums) {
      return { totalSongs: 0, completedSongs: 0, percentage: 0, status: 'locked' };
    }

    let totalSongs = 0;
    let completedSongs = 0;

    for (const alb of band.albums) {
      if (alb.tracks && alb.tracks.length > 0) {
        for (const trk of alb.tracks) {
          totalSongs++;
          if (storage.isSongCompleted(trk.id)) {
            completedSongs++;
          }
        }
      } else {
        totalSongs += (alb.trackCount || 0);
      }
    }

    if (totalSongs === 0) {
      return { totalSongs: 0, completedSongs: 0, percentage: 0, status: 'locked' };
    }

    const percentage = Math.round((completedSongs / totalSongs) * 100);

    let status = 'locked'; // 0%
    if (percentage === 100) {
      status = 'mastered';
    } else if (percentage > 0) {
      status = 'in-progress';
    }

    return {
      totalSongs,
      completedSongs,
      percentage,
      status
    };
  }

  /**
   * Calculate completion rate for a single album
   */
  static getAlbumStats(album) {
    if (!album || !album.tracks || album.tracks.length === 0) {
      return { total: album?.trackCount || 0, completed: 0, percentage: 0, isComplete: false };
    }

    let completed = 0;
    for (const trk of album.tracks) {
      if (storage.isSongCompleted(trk.id)) {
        completed++;
      }
    }

    const total = album.tracks.length;
    const percentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
      isComplete: percentage === 100
    };
  }

  /**
   * Calculate overall vault-wide completion metrics
   */
  static getOverallStats() {
    const bands = VaultManager.getAllBands();
    let totalSongs = 0;
    let totalCompleted = 0;
    let masteredBands = 0;

    for (const b of bands) {
      const stats = VaultManager.getBandStats(b);
      totalSongs += stats.totalSongs;
      totalCompleted += stats.completedSongs;
      if (stats.status === 'mastered') {
        masteredBands++;
      }
    }

    const vaultRate = totalSongs > 0 ? Math.round((totalCompleted / totalSongs) * 100) : 0;

    return {
      totalBands: bands.length,
      totalSongs,
      totalCompleted,
      masteredBands,
      vaultRate
    };
  }
}
