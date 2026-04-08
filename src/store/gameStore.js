import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    money: 0,
    lives: 0,
    wave: 0,
    currentLevel: 1,
    activePopup: null,
    isPlacingPatrol: false,
    startTime: 0,
    gameTime: 0,
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    allUsers: JSON.parse(localStorage.getItem('allPonyUsers')) || []
  }),
  
  actions: {
    // ВАЖНО: Убедись, что эта функция внутри actions!
    async saveGameResult(finalStats) {
      if (!this.currentUser) return;
      
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
      const calculatedScore = (finalStats.wave * 1000) + (finalStats.lives * 200) + Math.floor(finalStats.money / 2);
      const speedBonus = Math.max(0, 5000 - (timeSpent * 5));
      const finalScore = calculatedScore + speedBonus;

      const index = this.allUsers.findIndex(u => u.name === this.currentUser.name);
      if (index !== -1) {
        if (finalScore > (this.allUsers[index].bestScore || 0)) {
          this.allUsers[index].bestScore = finalScore;
          this.allUsers[index].bestTime = timeSpent;
          this.allUsers[index].bestMoney = finalStats.money;
          this.allUsers[index].bestLives = finalStats.lives;
          localStorage.setItem('allPonyUsers', JSON.stringify(this.allUsers));
          this.currentUser = { ...this.allUsers[index] };
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
      }
    },

    updateStats(m, l, w) { 
      this.money = m; this.lives = l; this.wave = w; 
      if (this.startTime > 0) this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
    },
    registerOrLogin(name, avatar) {
      let user = this.allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
      if (!user) {
        user = { name, avatar, bestScore: 0, regDate: new Date().toLocaleDateString(), bestTime: 0, bestMoney: 0, bestLives: 0 };
        this.allUsers.push(user);
      }
      this.currentUser = user;
      localStorage.setItem('allPonyUsers', JSON.stringify(this.allUsers));
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    },
    showPopup(data) { this.activePopup = data; },
    closePopup() { this.activePopup = null; },
    logout() { this.currentUser = null; localStorage.removeItem('currentUser'); }
  }
})