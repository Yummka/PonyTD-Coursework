import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    money: 0,
    lives: 0,
    wave: 0,
    currentLevel: 1,
    activePopup: null, // Для сюжета
    isPlacingPatrol: false, // Для Радуги
    // Данные профиля
    user: {
      name: localStorage.getItem('pony_name') || '',
      avatar: localStorage.getItem('pony_avatar') || 'Пинки Пай',
      isRegistered: !!localStorage.getItem('pony_name')
    }
  }),
  actions: {
    // Эта функция была потеряна или написана с ошибкой:
    registerUser(name, avatar) {
      this.user.name = name;
      this.user.avatar = avatar;
      this.user.isRegistered = true;
      
      // Сохраняем в память браузера
      localStorage.setItem('pony_name', name);
      localStorage.setItem('pony_avatar', avatar);
      
      console.log("Пользователь зарегистрирован:", name);
    },

    updateStats(m, l, w) {
      this.money = m;
      this.lives = l;
      this.wave = w;
    },

    showPopup(data) {
      this.activePopup = data;
    },

    closePopup() {
      this.activePopup = null;
    },

    logout() {
      this.user.isRegistered = false;
      this.user.name = '';
      localStorage.clear();
    }
  }
})