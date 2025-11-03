/**
 * Sound Manager for Karizma Campaign Game
 * Manages all audio playback for the game
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.volume = 1;
    this.initializeSounds();
  }

  /**
   * Initialize all sound objects
   */
  initializeSounds() {
    // Main background music - loops continuously
    this.sounds.main = {
      element: new Audio("/sounds/main.webm"),
      loop: true,
      volume: 0.5,
    };

    // Coin sound - plays when score increases (+0.5 or +3)
    this.sounds.coin = {
      element: new Audio("/sounds/coin.ogg"),
      loop: false,
      volume: 0.7,
    };

    // Wrong sound - plays when score decreases (-3)
    this.sounds.wrong = {
      element: new Audio("/sounds/wrong.ogg"),
      loop: false,
      volume: 0.7,
    };

    // Change sound - plays when switching between modes
    this.sounds.change = {
      element: new Audio("/sounds/change.ogg"),
      loop: false,
      volume: 0.6,
    };

    // Win sound - plays when game ends and win modal shows
    this.sounds.win = {
      element: new Audio("/sounds/win.mp3"),
      loop: false,
      volume: 0.8,
    };

    // Set initial volumes
    this.updateAllVolumes();
  }

  /**
   * Update volume for all sounds
   */
  updateAllVolumes() {
    Object.keys(this.sounds).forEach((key) => {
      const sound = this.sounds[key];
      sound.element.volume = sound.volume * this.volume;
    });
  }

  /**
   * Play main background music
   */
  playMainMusic() {
    if (this.isMuted) return;

    const mainSound = this.sounds.main.element;
    mainSound.currentTime = 0;
    mainSound.loop = true;
    mainSound.play().catch((error) => {
      console.warn("Could not play main music:", error);
    });
  }

  /**
   * Stop main background music
   */
  stopMainMusic() {
    const mainSound = this.sounds.main.element;
    mainSound.pause();
    mainSound.currentTime = 0;
  }

  /**
   * Play coin sound (for positive score)
   */
  playCoinSound() {
    if (this.isMuted) return;

    const coinSound = this.sounds.coin.element;
    coinSound.currentTime = 0;
    coinSound.play().catch((error) => {
      console.warn("Could not play coin sound:", error);
    });
  }

  /**
   * Play wrong sound (for negative score)
   */
  playWrongSound() {
    if (this.isMuted) return;

    const wrongSound = this.sounds.wrong.element;
    wrongSound.currentTime = 0;
    wrongSound.play().catch((error) => {
      console.warn("Could not play wrong sound:", error);
    });
  }

  /**
   * Play change sound (for mode switching)
   */
  playChangeSound() {
    if (this.isMuted) return;

    const changeSound = this.sounds.change.element;
    changeSound.currentTime = 0;
    changeSound.play().catch((error) => {
      console.warn("Could not play change sound:", error);
    });
  }

  /**
   * Play win sound (when game ends)
   */
  playWinSound() {
    if (this.isMuted) return;

    const winSound = this.sounds.win.element;
    winSound.currentTime = 0;
    winSound.play().catch((error) => {
      console.warn("Could not play win sound:", error);
    });
  }

  /**
   * Set master volume (0 to 1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMainMusic();
    } else {
      this.playMainMusic();
    }
    return this.isMuted;
  }

  /**
   * Mute all sounds
   */
  mute() {
    this.isMuted = true;
    this.stopMainMusic();
  }

  /**
   * Unmute all sounds
   */
  unmute() {
    this.isMuted = false;
    this.playMainMusic();
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    Object.keys(this.sounds).forEach((key) => {
      const sound = this.sounds[key];
      sound.element.pause();
      sound.element.currentTime = 0;
    });
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = SoundManager;
}
