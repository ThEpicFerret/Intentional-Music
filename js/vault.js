/**
 * Intentional Music — Vault & Gamification Core
 * Contains:
 *  - Rich starter roster across genres (Rock, Metal, Electronic, Alternative, Hip Hop, Jazz)
 *  - 90% listen completion rule calculation
 *  - Steam-style status tiers: Locked (0%), In-Progress (>0%), Mastered (100% Gold)
 */

import { storage } from './storage.js';

export const STARTER_BANDS = [
  // ROCK & METAL
  {
    id: 'b_pink_floyd',
    name: 'Pink Floyd',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    bioSummary: 'Iconic English rock band formed in London in 1965, pioneers of progressive and psychedelic rock.'
  },
  {
    id: 'b_avenged_sevenfold',
    name: 'Avenged Sevenfold',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600',
    bioSummary: 'American heavy metal band from Huntington Beach, California, formed in 1999.'
  },
  {
    id: 'b_led_zeppelin',
    name: 'Led Zeppelin',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600',
    bioSummary: 'English rock band formed in London in 1968, widely considered one of the most successful and innovative rock groups in history.'
  },
  {
    id: 'b_queen',
    name: 'Queen',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    bioSummary: 'British rock band formed in London in 1970 by Freddie Mercury, Brian May, Roger Taylor, and John Deacon.'
  },
  {
    id: 'b_metallica',
    name: 'Metallica',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600',
    bioSummary: 'American heavy metal band formed in 1981 in Los Angeles by vocalist/guitarist James Hetfield and drummer Lars Ulrich.'
  },
  {
    id: 'b_black_sabbath',
    name: 'Black Sabbath',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    bioSummary: 'English rock band formed in Birmingham in 1968, widely cited as the pioneers of heavy metal music.'
  },
  {
    id: 'b_iron_maiden',
    name: 'Iron Maiden',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    bioSummary: 'English heavy metal band formed in Leyton, East London, in 1975 by bassist and primary songwriter Steve Harris.'
  },
  {
    id: 'b_acdc',
    name: 'AC/DC',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    bioSummary: 'Australian rock band formed in Sydney in 1973 by brothers Malcolm and Angus Young.'
  },

  // ALTERNATIVE & INDIE
  {
    id: 'b_radiohead',
    name: 'Radiohead',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600',
    bioSummary: 'English rock band formed in Abingdon, Oxfordshire, in 1985, noted for their experimental approach to rock music.'
  },
  {
    id: 'b_nirvana',
    name: 'Nirvana',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600',
    bioSummary: 'American grunge rock band formed in Aberdeen, Washington, in 1987 by lead singer Kurt Cobain and bassist Krist Novoselic.'
  },
  {
    id: 'b_arctic_monkeys',
    name: 'Arctic Monkeys',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    bioSummary: 'English rock band formed in Sheffield in 2002, led by frontman Alex Turner.'
  },
  {
    id: 'b_the_strokes',
    name: 'The Strokes',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    bioSummary: 'American rock band from New York City, formed in 1998, leading figures of the 2000s indie rock revival.'
  },
  {
    id: 'b_red_hot_chili_peppers',
    name: 'Red Hot Chili Peppers',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600',
    bioSummary: 'American funk rock band formed in Los Angeles in 1982 by Anthony Kiedis and Flea.'
  },
  {
    id: 'b_the_cure',
    name: 'The Cure',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    bioSummary: 'English rock band formed in Crawley, West Sussex, in 1978, led by vocalist, guitarist, and songwriter Robert Smith.'
  },
  {
    id: 'b_depeche_mode',
    name: 'Depeche Mode',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    bioSummary: 'English electronic music band formed in Basildon, Essex, in 1980.'
  },
  {
    id: 'b_gorillaz',
    name: 'Gorillaz',
    genre: 'Alternative',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    bioSummary: 'English virtual band formed in 1998 by musician Damon Albarn and artist Jamie Hewlett.'
  },

  // ELECTRONIC & SYNTH
  {
    id: 'b_daft_punk',
    name: 'Daft Punk',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    bioSummary: 'French electronic music duo formed in 1993 in Paris by Thomas Bangalter and Guy-Manuel de Homem-Christo.'
  },
  {
    id: 'b_massive_attack',
    name: 'Massive Attack',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    bioSummary: 'English electronic group formed in Bristol in 1988, widely considered pioneers of the trip hop genre.'
  },
  {
    id: 'b_the_prodigy',
    name: 'The Prodigy',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    bioSummary: 'English electronic dance music band formed in Braintree, Essex, in 1990 by keyboardist and songwriter Liam Howlett.'
  },
  {
    id: 'b_kraftwerk',
    name: 'Kraftwerk',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    bioSummary: 'German band formed in Düsseldorf in 1970, widely regarded as innovators and pioneers of electronic music.'
  },
  {
    id: 'b_aphex_twin',
    name: 'Aphex Twin',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600',
    bioSummary: 'Irish-born British musician, composer, and DJ known for his idiosyncratic work in electronic styles like IDM and ambient techno.'
  },
  {
    id: 'b_justice',
    name: 'Justice',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    bioSummary: 'French electronic music duo consisting of Gaspard Augé and Xavier de Rosnay, known for their heavy rock influence.'
  },

  // HIP HOP
  {
    id: 'b_kendrick_lamar',
    name: 'Kendrick Lamar',
    genre: 'Hip Hop',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    bioSummary: 'American rapper and songwriter regarded as one of the most influential hip hop artists of his generation.'
  },
  {
    id: 'b_wu_tang_clan',
    name: 'Wu-Tang Clan',
    genre: 'Hip Hop',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    bioSummary: 'American hip hop collective formed in Staten Island, New York City, in 1992, widely regarded as one of the greatest hip hop groups.'
  },
  {
    id: 'b_outkast',
    name: 'Outkast',
    genre: 'Hip Hop',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    bioSummary: 'American hip hop duo formed in East Point, Georgia, in 1992, consisting of André 3000 and Big Boi.'
  },
  {
    id: 'b_mf_doom',
    name: 'MF DOOM',
    genre: 'Hip Hop',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600',
    bioSummary: 'British-American rapper and record producer notable for his intricate wordplay, metal mask, and villainous persona.'
  },
  {
    id: 'b_eminem',
    name: 'Eminem',
    genre: 'Hip Hop',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    bioSummary: 'American rapper credited with popularizing hip hop in Middle America and critically acclaimed as one of the greatest rappers of all time.'
  },

  // JAZZ & CLASSIC SOUL
  {
    id: 'b_miles_davis',
    name: 'Miles Davis',
    genre: 'Jazz',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    bioSummary: 'American trumpeter, bandleader, and composer among the most influential figures in the history of jazz.'
  },
  {
    id: 'b_john_coltrane',
    name: 'John Coltrane',
    genre: 'Jazz',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    bioSummary: 'American jazz saxophonist and composer, a pivotal figure in the history of jazz and twentieth-century music.'
  },
  {
    id: 'b_the_beatles',
    name: 'The Beatles',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600',
    bioSummary: 'English rock band formed in Liverpool in 1960, the most influential and best-selling music act in history.'
  },
  {
    id: 'b_david_bowie',
    name: 'David Bowie',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600',
    bioSummary: 'English singer-songwriter and actor, widely regarded as one of the most influential musicians of the 20th century.'
  }
];

export class VaultManager {
  /**
   * Get all bands (starter bands + custom user-added bands)
   */
  static getAllBands() {
    const custom = storage.getCustomBands();
    // Merge without duplicates by name
    const all = [...STARTER_BANDS];
    for (const c of custom) {
      if (!all.some(b => b.name.toLowerCase() === c.name.toLowerCase())) {
        all.unshift(c);
      }
    }
    return all;
  }

  /**
   * Calculate completion rate for a band
   * Based strictly on songs listened to at >= 90% duration
   */
  static getBandStats(band) {
    if (!band || !band.albums || band.albums.length === 0) {
      return { totalSongs: 10, completedSongs: 0, percentage: 0, status: 'locked' };
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

    if (totalSongs === 0) totalSongs = 10;

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
