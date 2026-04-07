<script setup>
import { useGameStore } from '../store/gameStore';
import { towerImages } from '../engine/config';
import { useRouter } from 'vue-router';

const store = useGameStore();
const router = useRouter();

const resetProgress = () => {
  if (confirm("ТЫ УВЕРЕН, ЧТО ХОЧЕШЬ УДАЛИТЬ СВОЙ ПУТЬ?")) {
    store.logout();
    router.push('/auth');
  }
};
</script>

<template>
  <div class="h-full flex items-center justify-center bg-[#1a1a2e] p-6 text-white">
    <div v-if="store.user.isRegistered" class="bg-[#3c3c58] border-4 border-pink-400 p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full">
      
      <div class="w-24 h-24 bg-pink-500 rounded-full mx-auto mb-6 border-4 border-white flex items-center justify-center overflow-hidden">
         <img :src="towerImages[store.user.avatar]?.src" class="w-16 h-16 object-contain" />
      </div>

      <h2 class="text-lg font-bold mb-2 uppercase">{{ store.user.name }}</h2>
      <p class="text-[10px] text-pink-300 mb-8 uppercase tracking-widest">Герой Эквестрии</p>

      <div class="space-y-3">
        <button @click="router.push('/game')" class="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold text-[10px]">В БОЙ</button>
        <button @click="resetProgress" class="w-full py-3 bg-red-900/40 hover:bg-red-600 rounded-xl font-bold text-[10px] text-red-200">СБРОСИТЬ ПРОФИЛЬ</button>
      </div>
    </div>

    <div v-else class="text-center">
      <p class="mb-4 text-xs">МЫ ТЕБЯ НЕ ЗНАЕМ...</p>
      <button @click="router.push('/auth')" class="px-6 py-3 bg-pink-600 rounded-xl">ПРЕДСТАВИТЬСЯ</button>
    </div>
  </div>
</template>