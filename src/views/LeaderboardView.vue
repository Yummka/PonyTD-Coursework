<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const players = ref([]);
const loading = ref(true);
const search = ref('');

// Асинхронный запрос к API (Requirement: Async API)
const loadData = async () => {
  try {
    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    players.value = res.data.map(u => ({
      id: u.id,
      name: u.username,
      score: Math.floor(Math.random() * 10000)
    })).sort((a, b) => b.score - a.score);
  } finally {
    loading.value = false;
  }
};

// Вычисляемое свойство (Requirement: Computed)
const filteredList = computed(() => {
  return players.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()));
});

onMounted(loadData);
</script>

<template>
  <div class="h-full p-8 bg-slate-900 text-white overflow-y-auto">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-4xl font-black mb-6 text-pink-500">ЗАЛ СЛАВЫ</h1>
      
      <input v-model="search" type="text" placeholder="Поиск защитника..." class="w-full bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700 outline-none focus:border-pink-500">

      <div v-if="loading" class="text-center py-10">Загрузка данных...</div>
      
      <div v-else class="space-y-2">
        <div v-for="(p, i) in filteredList" :key="p.id" class="flex justify-between items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
          <div class="flex gap-4">
            <span class="font-bold text-slate-500">#{{ i + 1 }}</span>
            <span class="font-bold">{{ p.name }}</span>
          </div>
          <span class="text-pink-400 font-mono">{{ p.score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>