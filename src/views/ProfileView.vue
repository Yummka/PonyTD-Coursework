<script setup>
import { ref } from 'vue';
import { useGameStore } from '../store/gameStore';
import { towerImages } from '../engine/config';
import { useRouter } from 'vue-router';

const store = useGameStore();
const router = useRouter();

const isEditing = ref(false);
const editName = ref(store.currentUser?.name || '');
const editAvatar = ref(store.currentUser?.avatar || 'Пинки Пай');
const avatars = ['Пинки Пай', 'Эппл Джек', 'Твайлайт Спаркл', 'Флаттершай', 'Радуга Дэш', 'Рэрити'];

const handleUpdate = async () => {
  if (editName.value.length < 3) return;
  await store.updateProfile(editName.value, editAvatar.value);
  isEditing.value = false;
};
</script>

<template>
  <div class="h-full flex items-center justify-center bg-[#1a1a2e] p-6 text-white font-sans">
    <div v-if="store.currentUser" class="bg-[#3c3c58] border-4 border-pink-400 p-8 rounded-3xl shadow-2xl max-w-lg w-full relative">
      
      <h1 class="text-lg font-bold text-pink-300 mb-6 uppercase italic">Анкета Защитника</h1>

      <div class="flex flex-col md:flex-row gap-8 items-center">
        <!-- Левая часть: Аватар -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-32 h-32 bg-black/40 rounded-full border-4 border-pink-500 flex items-center justify-center overflow-hidden">
            <img :src="towerImages[isEditing ? editAvatar : store.currentUser.avatar]?.src" class="w-20 h-20 object-contain" />
          </div>
          <button v-if="!isEditing" @click="isEditing = true" class="text-[8px] text-pink-400 underline">ИЗМЕНИТЬ</button>
        </div>

        <!-- Правая часть: Инфо -->
        <div class="flex-grow text-left space-y-4 w-full">
          <div v-if="!isEditing">
            <div class="text-[8px] text-slate-400">ИМЯ:</div>
            <div class="text-sm font-bold uppercase">{{ store.currentUser.name }}</div>
          </div>
          <div v-else class="space-y-4">
            <input v-model="editName" class="w-full bg-black/40 border-b-2 border-pink-500 p-2 text-xs outline-none" />
            <div class="grid grid-cols-3 gap-2">
              <button v-for="p in avatars" :key="p" @click="editAvatar = p" 
                      class="p-1 border rounded" :class="editAvatar === p ? 'border-pink-500 bg-pink-500/20' : 'border-white/10'">
                <img :src="towerImages[p]?.src" class="w-6 h-6 object-contain" />
              </button>
            </div>
            <button @click="handleUpdate" class="w-full py-2 bg-green-600 text-[10px] rounded font-bold">СОХРАНИТЬ</button>
          </div>

          <!-- Личная статистика -->
          <div class="bg-black/20 p-4 rounded-xl space-y-2">
            <div class="text-[7px] text-yellow-400 uppercase">Лучший результат:</div>
            <div class="text-xs font-bold text-white">{{ store.currentUser.bestScore || 0 }} ОЧКОВ</div>
            <div class="grid grid-cols-2 gap-2 text-[7px] text-slate-400 uppercase">
              <span>Время: {{ store.currentUser.bestTime || 0 }}с</span>
              <span>Монеты: {{ store.currentUser.bestMoney || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex gap-4">
        <button @click="router.push('/game')" class="flex-grow py-4 bg-pink-600 rounded-xl font-bold text-[10px]">В БОЙ</button>
        <button @click="store.logout(); router.push('/auth')" class="px-4 bg-red-900/40 rounded-xl text-[8px]">ВЫЙТИ</button>
      </div>
    </div>
  </div>
</template>