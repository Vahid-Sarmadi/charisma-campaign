/**
 * missions.js
 * Frontend JavaScript for mission system
 */

class MissionManager {
  constructor() {
    this.missions = {};
    this.totalHeal = 0;
    this.isLoading = false;
  }

  /**
   * Initialize mission manager and load mission status
   */
  async init() {
    console.log("Initializing Mission Manager...");
    await this.loadMissionStatus();
    this.attachEventListeners();
  }

  /**
   * Load mission status from server
   */
  async loadMissionStatus() {
    try {
      this.isLoading = true;
      const response = await fetch("/missions/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 200) {
        this.missions = data.missions;
        this.totalHeal = data.totalHeal;
        this.updateUI();
      } else {
        console.error("Error loading mission status:", data.message);
      }
    } catch (error) {
      console.error("Error loading mission status:", error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Check a specific mission
   */
  async checkMission(missionKey) {
    try {
      this.isLoading = true;
      const button = document.querySelector(`[data-mission="${missionKey}"]`);
      if (button) {
        button.disabled = true;
        button.textContent = "جاری...";
      }

      const response = await fetch(`/missions/check/${missionKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === 200) {
        if (data.completed) {
          console.log(`Mission ${missionKey} completed!`);
          this.showNotification(
            `ماموریت انجام شد! +${data.healAdded} heal`,
            "success"
          );
          this.missions[missionKey].completed = true;
          this.totalHeal = data.totalHeal;
          this.updateUI();
        } else {
          this.showNotification("ماموریت هنوز انجام نشده است", "info");
        }
      } else {
        this.showNotification("خطا در بررسی ماموریت", "error");
      }
    } catch (error) {
      console.error("Error checking mission:", error);
      this.showNotification("خطا در ارتباط با سرور", "error");
    } finally {
      this.isLoading = false;
      await this.loadMissionStatus();
    }
  }

  /**
   * Check all missions
   */
  async checkAllMissions() {
    try {
      this.isLoading = true;
      const button = document.querySelector("[data-action='check-all']");
      if (button) {
        button.disabled = true;
        button.textContent = "جاری...";
      }

      const response = await fetch("/missions/check-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === 200) {
        if (data.completedMissions.length > 0) {
          const missionNames = data.completedMissions
            .map((m) => m.name)
            .join("، ");
          this.showNotification(
            `${data.completedMissions.length} ماموریت انجام شد! +${data.totalHealAdded} heal`,
            "success"
          );
          this.totalHeal = data.totalHeal;
          this.updateUI();
        } else {
          this.showNotification("هیچ ماموریت جدیدی انجام نشده است", "info");
        }
      } else {
        this.showNotification("خطا در بررسی ماموریت‌ها", "error");
      }
    } catch (error) {
      console.error("Error checking all missions:", error);
      this.showNotification("خطا در ارتباط با سرور", "error");
    } finally {
      this.isLoading = false;
      await this.loadMissionStatus();
    }
  }

  /**
   * Manually complete a mission (for testing)
   */
  async manualCompleteMission(missionKey) {
    try {
      this.isLoading = true;
      const response = await fetch(`/missions/manual-complete/${missionKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === 200) {
        this.showNotification(
          `ماموریت ${missionKey} انجام شد! +${data.healAdded} heal`,
          "success"
        );
        this.totalHeal = data.totalHeal;
        this.updateUI();
      } else {
        this.showNotification("خطا در انجام ماموریت", "error");
      }
    } catch (error) {
      console.error("Error completing mission:", error);
      this.showNotification("خطا در ارتباط با سرور", "error");
    } finally {
      this.isLoading = false;
      await this.loadMissionStatus();
    }
  }

  /**
   * Update UI with current mission status
   */
  updateUI() {
    // Update mission items
    for (const [key, mission] of Object.entries(this.missions)) {
      const element = document.querySelector(`[data-mission="${key}"]`);
      if (element) {
        if (mission.completed) {
          element.classList.add("completed");
          element.disabled = true;
          element.textContent = "انجام شده";
        } else {
          element.classList.remove("completed");
          element.disabled = false;
          element.textContent = "بررسی";
        }
      }
    }

    // Update total heal display
    const healDisplay = document.querySelector("[data-heal-total]");
    if (healDisplay) {
      healDisplay.textContent = this.totalHeal;
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${
        type === "success"
          ? "#4caf50"
          : type === "error"
            ? "#f44336"
            : "#2196f3"
      };
      color: white;
      border-radius: 4px;
      z-index: 9999;
      animation: slideIn 0.3s ease-in-out;
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in-out";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Attach event listeners to mission buttons
   */
  attachEventListeners() {
    // Check individual mission buttons
    document.querySelectorAll("[data-mission]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const missionKey = button.getAttribute("data-mission");
        this.checkMission(missionKey);
      });
    });

    // Check all missions button
    const checkAllButton = document.querySelector("[data-action='check-all']");
    if (checkAllButton) {
      checkAllButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.checkAllMissions();
      });
    }
  }
}

// Initialize mission manager when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const missionManager = new MissionManager();
  missionManager.init();
  window.missionManager = missionManager; // Make it globally accessible
});

