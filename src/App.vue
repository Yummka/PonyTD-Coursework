<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-900 text-white font-sans">
    <nav class="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shrink-0">
      <div @click="router.push('/')" class="text-2xl font-black text-pink-500 cursor-pointer">PONY TD</div>
      <div class="flex gap-6">
        <router-link to="/game" class="hover:text-pink-400 transition">В бой!</router-link>
        <router-link to="/leaderboard" class="hover:text-pink-400 transition">Лидеры</router-link>
        <router-link to="/auth" class="bg-pink-600 px-4 py-1 rounded-lg">Войти</router-link>
      </div>
    </nav>
    <main class="flex-grow relative overflow-hidden">
      <router-view /> <!-- Здесь будут меняться страницы -->
    </main>
  </div>
</template>