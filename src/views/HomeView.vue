<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900">
    <div class="space-y-6 max-w-2xl">
      <h1 class="text-6xl font-black text-white italic tracking-tighter">
        PONY <span class="text-pink-500">DEFENSE</span>
      </h1>
      <p class="text-lg text-slate-400">
        Защитите Эквестрию от армии Короля Сомбры! 
        Нанимайте героев, улучшайте оборону и станьте легендой.
      </p>
      <div class="flex gap-4 justify-center pt-6">
        <button @click="router.push('/game')" class="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-pink-500/20">
          ИГРАТЬ СЕЙЧАС
        </button>
        <button @click="router.push('/auth')" class="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition">
          АККАУНТ
        </button>
      </div>
    </div>
  </div>
</template>