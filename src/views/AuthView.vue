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
const error = ref('');

const startJourney = () => {
  console.log("Попытка регистрации..."); // Для отладки
  
  if (!nickname.value || nickname.value.trim().length < 3) {
    error.value = "ИМЯ СЛИШКОМ КОРОТКОЕ!";
    return;
  }
  
  try {
    // Сохраняем данные в стор
    store.registerUser(nickname.value, selectedAvatar.value);
    console.log("Данные сохранены, перехожу в игру");
    
    // ПЕРЕХОД
    router.push('/game');
  } catch (err) {
    console.error("Ошибка при регистрации:", err);
    error.value = "ЧТО-ТО ПОШЛО НЕ ТАК...";
  }
};
</script>

<template>
  <div class="h-full flex items-center justify-center bg-[#1a1a2e] p-6 text-white font-sans">
    <div class="bg-[#3c3c58] border-4 border-pink-400 p-8 rounded-3xl shadow-2xl max-w-xl w-full text-center relative">
      
      <h1 class="text-lg font-bold text-pink-300 mb-8 uppercase italic tracking-tighter">
        Как зовут нашего защитника?
      </h1>

      <!-- ВЫБОР АВАТАРКИ -->
      <div class="flex flex-col items-center gap-6 mb-8">
        <div class="w-32 h-32 bg-black/40 rounded-full border-4 border-pink-500 flex items-center justify-center shadow-inner overflow-hidden">
          <!-- УБРАЛИ animate-bounce, теперь пони стоит спокойно -->
          <img :src="towerImages[selectedAvatar]?.src" class="w-20 h-20 object-contain" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <button v-for="pony in options" :key="pony" 
            @click="selectedAvatar = pony"
            class="p-2 border-2 rounded-xl transition-all"
            :class="selectedAvatar === pony ? 'border-pink-500 bg-pink-500/20 scale-105' : 'border-white/10 bg-black/20'"
          >
            <img :src="towerImages[pony]?.src" class="w-10 h-10 object-contain" />
          </button>
        </div>
      </div>

      <!-- ВВОД ИМЕНИ -->
      <div class="space-y-4">
        <input 
          v-model="nickname"
          type="text" 
          placeholder="ВВЕДИТЕ НИК..."
          maxlength="12"
          class="w-full bg-black/40 border-b-4 border-pink-500 p-4 text-center text-[12px] outline-none focus:bg-black/60 transition-all uppercase"
          @keyup.enter="startJourney"
        />
        
        <p v-if="error" class="text-red-400 text-[8px] animate-pulse uppercase">{{ error }}</p>

        <button 
          @click="startJourney"
          class="w-full py-5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl border-b-4 border-pink-800 active:translate-y-1 active:border-b-0 transition-all text-[10px]"
        >
          ГОТОВО К БОЮ!
        </button>
      </div>

      <div class="absolute -top-4 -right-4 text-4xl">✨</div>
    </div>
  </div>
</template>