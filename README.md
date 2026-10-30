# 🎵 Intentional Music Vault

An intentional, mindful music listening web application with **Steam-style achievement completion**, disguised pure-audio YouTube Music integration, and zero algorithmic recommendation distractions.

Built for desktop and mobile, local-first, and **100% ready for instant deployment to GitHub Pages (`username.github.io`)**.

---

## ✨ Core Features

### 1. 🏆 Steam-Style Discography & Band Gamification
* **Locked (0%)**: Unexplored bands appear in grayscale with locked styling.
* **In-Progress (>0% & <100%)**: Bands gain full vibrant color and dynamic progress bars.
* **100% Mastered (Prestige Tier)**: Once you listen to all songs in a band's discography, the band unlocks a **glowing golden aura border** and the **Mastered Crown Badge**.
* **90% Completion Rule**: To prevent skipping or fake listens, a song **only** counts as completed once **at least 90% of the song's duration has played**. The player displays a real-time completion gauge and gold marker at the 90% mark.

### 2. 🎧 Disguised Pure-Audio Player (No Video Distractions)
* Powered by the **YouTube IFrame Audio Engine** running completely invisibly offscreen.
* No video clips, no visual noise, no algorithmic suggestions.
* Dressed in a sleek, dark-mode bottom player bar inspired by YouTube Music desktop (album art, title, artist, seekbar with 90% goalpost, volume, like button).
* **"Play Album in Order"**: Play full studio albums sequentially from track 1 to the end to appreciate the era and artistic intent.

### 3. 💿 Curated vs. Unfiltered Search
* **Curated Discography Mode**: Filters out spam compilation box sets (e.g. "Top 50 Best Hits", endless remasters) to present canonical studio albums and iconic live releases (e.g., Avenged Sevenfold's *Live in the LBC*).
* **Unfiltered YouTube Search Mode**: A one-click toggle at the top of the search bar allows you to search for small, underground, or indie artists not listed in mainstream music databases and add them straight to your vault.

### 4. 👥 Band Members, Production Credits & Bio
* Click the **"Band Members & Bio"** button to open a clean, non-cluttered summary view powered by Wikipedia, listing the musicians, their instruments, active eras, and concise historical background.

### 5. 🔒 Local-First & Private (Optional Firebase Google Cloud Sync)
* **Zero friction**: Works immediately out of the box with 100% private browser `LocalStorage`.
* **Multi-Device Cloud Sync**: Optionally connect your own Firebase project with Google Sign-In via the Settings modal. Your listens, likes, and custom bands are synced privately to your Firestore user account.

---

## 🚀 How to Run Locally

Because this project is built with modern ES modules and zero compilation dependencies:
1. Double-click `index.html` in your file explorer to open it directly in Google Chrome, Edge, or Brave.
2. Or run a lightweight local server (e.g. with Python or VS Code Live Server):
   ```bash
   python -m http.server 8000
   ```
   and navigate to `http://localhost:8000`.

---

## 🌐 How to Deploy to GitHub Pages (`username.github.io`)

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Intentional Music Vault"
   ```
2. Create a repository on GitHub (e.g., `intentional-music` or `username.github.io`).
3. Push to your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/intentional-music.git
   git branch -M main
   git push -u origin main
   ```
4. In your GitHub repository:
   * Go to **Settings** $\rightarrow$ **Pages**.
   * Under **Build and deployment**, set **Source** to `Deploy from a branch` and select `main` / `root`.
   * Click **Save**. Within 1–2 minutes, your app is live worldwide!

---

## 📱 Android Full-Screen App (PWA)

1. Open your GitHub Pages link in **Google Chrome for Android**.
2. Tap the three dots menu (`⋮`) in the top-right corner.
3. Select **"Install app"** or **"Add to Home Screen"**.
4. The app now launches in full-screen standalone mode without any browser search bars or chrome, functioning like a native Android app.
