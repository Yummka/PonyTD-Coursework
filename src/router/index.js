import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import AuthView from '../views/AuthView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/game', name: 'game', component: GameView },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
    { path: '/profile', name: 'profile', component: ProfileView }
  ]
})

// ВОТ ЭТА СТРОЧКА САМАЯ ВАЖНАЯ!
export default router