<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../store/gameStore';
import { towerImages } from '../engine/config';

const router = useRouter();
const store = useGameStore();

const options = ['Пинки Пай', 'Эппл Джек', 'Твайлайт Спаркл', 'Флаттершай', 'Радуга Дэш', 'Рэрити'];
const selectedAvatar = ref('Пинки Пай');
const nickname = ref('');
const loading = ref(false);

const handleAuth = async () => {
  if (nickname.value.trim().length < 3) return;
  
  loading.value = true;
  await store.registerOrLogin(nickname.value, selectedAvatar.value);
  loading.value = false;
  
  router.push('/game');
};
</script>

<template>
  <div class="h-full flex items-center justify-center bg-[#1a1a2e] p-6 text-white font-sans">
    <div class="bg-[#3c3c58] border-4 border-pink-400 p-8 rounded-3xl shadow-2xl max-w-xl w-full text-center">
      <h1 class="text-lg font-bold text-pink-300 mb-8 uppercase">Кто ты, защитник?</h1>

      <div class="flex flex-col items-center gap-6 mb-8">
        <div class="w-32 h-32 bg-black/40 rounded-full border-4 border-pink-500 flex items-center justify-center overflow-hidden">
          <img :src="towerImages[selectedAvatar]?.src" class="w-20 h-20 object-contain" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <button v-for="pony in options" :key="pony" @click="selectedAvatar = pony"
            class="p-2 border-2 rounded-xl transition-all"
            :class="selectedAvatar === pony ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-black/20'">
            <img :src="towerImages[pony]?.src" class="w-8 h-8 object-contain" />
          </button>
        </div>
      </div>

      <input v-model="nickname" type="text" placeholder="ТВОЁ ИМЯ..." class="w-full bg-black/40 border-b-4 border-pink-500 p-4 text-center text-xs outline-none mb-4 uppercase" />
      
      <button @click="handleAuth" :disabled="loading"
        class="w-full py-5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl border-b-4 border-pink-800 transition-all text-[10px]">
        {{ loading ? 'МАГИЯ...' : 'ВОЙТИ В ЭКВЕСТРИЮ' }}
      </button>
    </div>
  </div>
</template>