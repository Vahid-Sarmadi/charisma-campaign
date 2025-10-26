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
  constructor(chartData) {
    this.chartData = chartData;
    this.score = 0;
    this.currentIndex = 0;
    this.gameActive = false;
    this.lastCheckTime = 0;
    this.checkInterval = 500; // 0.5 seconds in milliseconds
    this.currentMode = "sabet"; // 'sabet' or 'gold'
    this.animatingCoins = [];
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
   * Rules:
   * - Chart UP + Gold mode = +1 (correct)
   * - Chart DOWN + Fixed Income mode = +1 (correct)
   * - Chart LINEAR + any mode = +1 (correct)
   * - Otherwise = -1 (incorrect)
   */
  checkAndUpdateScore() {
    const correctMode = this.getCorrectMode();
    const isCorrect = correctMode === "any" || this.currentMode === correctMode;

    if (isCorrect) {
      this.addScore(1);
      this.showCoinAnimation(true); // Green animation
    } else {
      this.subtractScore(1);
      this.showCoinAnimation(false); // Red animation
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
   * @param {boolean} isPositive - true for +1 (green), false for -1 (red)
   */
  showCoinAnimation(isPositive) {
    const coinElement = document.createElement("div");
    coinElement.className = isPositive
      ? "coin-animation positive"
      : "coin-animation negative";
    coinElement.innerHTML = isPositive ? "+۱" : "-۱";

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
