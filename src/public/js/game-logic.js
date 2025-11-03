/**
 * Game Logic for Karizma Campaign Game
 *
 * Rules:
 * 1. Chart progresses through 24 hours (06:00 to 06:00 next day)
 * 2. User must select "طلا" (Gold) when chart is going UP
 * 3. User must select "درآمد ثابت" (Fixed Income) when chart is going DOWN
 * 4. When chart is LINEAR (flat), any mode is correct
 * 5. Every 1 second: check if user is on correct mode
 *    - If correct: +1 coin with animation (green)
 *    - If wrong: -1 coin with animation (red, but score never goes below 0)
 */

class GameLogic {
  constructor(chartData, soundManager = null) {
    this.chartData = chartData;
    this.score = 0;
    this.currentIndex = 0;
    this.gameActive = false;
    this.lastCheckTime = 0;
    this.checkInterval = 500; // 0.5 seconds in milliseconds
    this.currentMode = "sabet"; // 'sabet' or 'gold'
    this.animatingCoins = [];
    this.soundManager = soundManager;
  }

  /**
   * Determine if chart is going UP, DOWN, or LINEAR
   * @returns {string} 'up', 'down', or 'linear'
   */
  getChartTrend() {
    if (this.currentIndex >= this.chartData.length - 1) {
      return "linear";
    }

    const currentValue = this.chartData[this.currentIndex].value;
    const nextValue = this.chartData[this.currentIndex + 1].value;

    if (nextValue > currentValue) {
      return "up";
    } else if (nextValue < currentValue) {
      return "down";
    } else {
      return "linear";
    }
  }

  /**
   * Get the correct mode based on chart trend
   * Rules:
   * - UP trend + GOLD mode = correct
   * - DOWN trend + SABET mode = correct
   * - LINEAR trend + any mode = correct
   * @returns {string} 'gold', 'sabet', or 'any'
   */
  getCorrectMode() {
    const trend = this.getChartTrend();
    if (trend === "up") {
      return "gold"; // طلا
    } else if (trend === "down") {
      return "sabet"; // درآمد ثابت
    } else {
      return "any"; // LINEAR - any mode is correct
    }
  }

  /**
   * Check if user is on correct mode and update score
   * New Rules:
   * - Fixed Income (sabet) mode: always +0.5 points
   * - Gold mode + UP trend: +3 points
   * - Gold mode + DOWN trend: -3 points
   * - Gold mode + LINEAR trend: no change (0 points)
   */
  checkAndUpdateScore() {
    const trend = this.getChartTrend();

    if (this.currentMode === "sabet") {
      // درآمد ثابت: همیشه +0.5 امتیاز
      this.addScore(0.5);
      this.showCoinAnimation(true, 0.5); // Green animation with +0.5
      // Play coin sound for positive score
      if (this.soundManager) {
        this.soundManager.playCoinSound();
      }
    } else if (this.currentMode === "gold") {
      // طلا: بسته به روند بازار
      if (trend === "up") {
        // بازار صعودی: +3 امتیاز
        this.addScore(3);
        this.showCoinAnimation(true, 3); // Green animation with +3
        // Play coin sound for positive score
        if (this.soundManager) {
          this.soundManager.playCoinSound();
        }
      } else if (trend === "down") {
        // بازار نزولی: -3 امتیاز
        this.subtractScore(3);
        this.showCoinAnimation(false, 3); // Red animation with -3
        // Play wrong sound for negative score
        if (this.soundManager) {
          this.soundManager.playWrongSound();
        }
      }
      // اگر LINEAR باشد، هیچ امتیازی اضافه یا کم نمی‌شود
    }
  }

  /**
   * Add score
   */
  addScore(amount) {
    this.score += amount;
  }

  /**
   * Subtract score (but never go below 0)
   */
  subtractScore(amount) {
    this.score = Math.max(0, this.score - amount);
  }

  /**
   * Show coin animation
   * @param {boolean} isPositive - true for positive score (green), false for negative (red)
   * @param {number} amount - the amount of score change (e.g., 0.5, 3)
   */
  showCoinAnimation(isPositive, amount) {
    const coinElement = document.createElement("div");
    coinElement.className = isPositive
      ? "coin-animation positive"
      : "coin-animation negative";

    // Convert number to Persian
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const amountStr = amount.toString();
    let persianAmount = "";
    for (let i = 0; i < amountStr.length; i++) {
      const char = amountStr[i];
      if (char >= "0" && char <= "9") {
        persianAmount += persianNumbers[parseInt(char)];
      } else {
        persianAmount += char; // Keep decimal point or other characters
      }
    }

    coinElement.innerHTML = isPositive
      ? `+${persianAmount}`
      : `-${persianAmount}`;

    // Position it at the chart area
    const chartContainer = document.querySelector(".chart-container");
    if (chartContainer) {
      chartContainer.appendChild(coinElement);

      // Remove after animation
      setTimeout(() => {
        coinElement.remove();
      }, 1000);
    }
  }

  /**
   * Update current mode
   */
  setMode(mode) {
    this.currentMode = mode;
    // Play change sound when mode is switched
    if (this.soundManager) {
      this.soundManager.playChangeSound();
    }
  }

  /**
   * Move to next data point
   */
  nextDataPoint() {
    if (this.currentIndex < this.chartData.length - 1) {
      this.currentIndex++;
    }
  }

  /**
   * Get current data point
   */
  getCurrentDataPoint() {
    return this.chartData[this.currentIndex];
  }

  /**
   * Get score
   */
  getScore() {
    return this.score;
  }

  /**
   * Reset game
   */
  reset() {
    this.score = 0;
    this.currentIndex = 0;
    this.currentMode = "sabet";
  }

  /**
   * Get game progress (0 to 1)
   */
  getProgress() {
    return this.currentIndex / this.chartData.length;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = GameLogic;
}
