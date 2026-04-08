<script setup>
import { computed } from 'vue';
import { useGameStore } from '../store/gameStore';
import { towerImages } from '../engine/config';

const store = useGameStore();

const sortedPlayers = computed(() => {
  return [...store.allUsers].sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0));
});
</script>

<template>
  <div class="h-full p-10 bg-[#1a1a2e] text-white overflow-y-auto font-sans">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-black mb-10 text-pink-500 italic text-center uppercase tracking-tighter">
        Зал Славы Эквестрии
      </h1>
      
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-[8px] text-pink-300 uppercase border-b border-pink-500/30">
            <th class="p-4">Ранг</th>
            <th class="p-4">Герой</th>
            <th class="p-4 text-center">Статистика (Жизни/Деньги/Время)</th>
            <th class="p-4 text-right">Счет</th>
          </tr>
        </thead>
        <tbody class="text-xs">
          <tr v-for="(player, i) in sortedPlayers" :key="player.name" 
              class="border-b border-white/5 transition-colors hover:bg-white/5"
              :class="{'bg-pink-500/10': player.name === store.currentUser?.name}">
            
            <td class="p-4 font-black" :class="i === 0 ? 'text-yellow-400' : 'text-slate-500'">
              #{{ i + 1 }}
            </td>
            
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img :src="towerImages[player.avatar]?.src" class="w-8 h-8 object-contain bg-black/20 rounded-lg p-1 border border-white/10" />
                <span class="font-bold uppercase tracking-tighter">{{ player.name }}</span>
              </div>
            </td>

            <td class="p-4 text-center text-[7px] text-slate-400 space-x-2 font-mono uppercase">
              <span class="text-red-400">❤️{{ player.bestLives || 0 }}</span>
              <span class="text-emerald-400">💰{{ player.bestMoney || 0 }}</span>
              <span class="text-cyan-400">⏱️{{ player.bestTime || 0 }}С</span>
            </td>

            <td class="p-4 text-right font-black text-pink-400 text-sm">
              {{ player.bestScore || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>