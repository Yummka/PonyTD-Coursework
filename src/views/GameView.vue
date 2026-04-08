<script setup>
import { onMounted, ref, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../store/gameStore';
import Game from '../engine/game';
import { TOWER_CONFIG, towerImages } from '../engine/config';
import Modal from '../components/Common/Modal.vue';

const router = useRouter();
const store = useGameStore();
const canvasRef = ref(null);
const isLevelModalOpen = ref(true); 
let gameInstance = null;

const exitToMenu = () => {
  console.log("Выход в меню...");
  gameInstance?.stop(); // Это важно, чтобы убить игровой цикл
  router.push('/'); 
};

const introContent = {
  2: { 
    title: "ФЛАТТЕРШАЙ ПРИСОЕДИНЯЕТСЯ!", 
    img: "Флат_стоит", 
    color: "text-yellow-300", 
    text: "Понивилль в опасности! Флаттершай не любит драться, но её добрый взгляд может <b>замедлить</b> любого врага. <br><br><b>Механика:</b> Не наносит урона, но значительно снижает скорость врагов." 
  },
  3: { 
    title: "СТИЛЬ И СКОРОСТЬ!", 
    imgs: ["РадугаСтоит", "РаритиСтоит"],
    color: "text-cyan-300", 
    text: "Радуга Дэш и Рэрити спешат на помощь! <br><br><b>Радуга:</b> Патрулирует небо между точками, нанося урон. <br><b>Рэрити:</b> Дива-снайпер. Бьет редко, но очень больно!" 
  },
  4: { 
    title: "ВЕЧНАЯ НОЧЬ НАЙТМЕР МУН!", 
    img: null, // УБРАЛИ ЛУНУ
    color: "text-indigo-400", 
    text: "Тьма окутала Эквестрию... Принцесса Луна превратилась в <b>Найтмер Мун</b>! Выстойте в этой битве, чтобы вернуть принцессу к свету!" 
  },
  5: { 
    title: "ВОЗВРАЩЕНИЕ ПРИНЦЕССЫ!", 
    img: "ЛунаСтоит", 
    color: "text-blue-300", 
    text: "Магия дружбы победила! <br><br><b>Механика Луны:</b> За золото Луна обрушивает звездный гнев на всё поле боя!" 
  },
  6: { 
    title: "КРИСТАЛЬНЫЙ ФИНАЛ!", 
    img: "ДёрпиСтоит", 
    color: "text-pink-300", 
    text: "Дёрпи хочет помочь и принесла маффины! <br><br><b>Механика Дёрпи:</b> Кидает маффины, давая <b>бафф к урону</b>. Но она может промахнуться и усилить врага!" 
  }
};

onMounted(() => {
  if (canvasRef.value) {
    gameInstance = new Game(canvasRef.value, store);
    const syncInterval = setInterval(() => {
      if (gameInstance && gameInstance.isRunning) {
        store.updateStats(gameInstance.money, gameInstance.lives, gameInstance.wave);
        if (gameInstance.lives <= 0 && gameInstance.wave > 0 && !store.activePopup) {
           store.showPopup({ type: 'lose', title: 'ПОРАЖЕНИЕ...', text: 'Враги прорвали оборону!' });
           gameInstance.isRunning = false;
        }
      }
    }, 100);
    onUnmounted(() => { clearInterval(syncInterval); gameInstance?.stop(); });
  }
});

const selectLevel = (lvl) => {
  store.currentLevel = lvl;
  gameInstance?.startLevel(lvl);
  isLevelModalOpen.value = false;
  if (introContent[lvl]) store.showPopup({ ...introContent[lvl], type: 'intro' });
};

const handleAction = () => {
  const popupType = store.activePopup?.type;
  store.closePopup();
  if (popupType === 'win') {
    if (store.currentLevel < 6) selectLevel(store.currentLevel + 1);
    else isLevelModalOpen.value = true;
  } else if (popupType === 'lose') {
    selectLevel(store.currentLevel);
  } else {
    if (gameInstance) gameInstance.isRunning = true;
  }
};

const getTowerImg = (type) => towerImages[type]?.src || '';
const selectTower = (type) => gameInstance?.selectTower(type);
const toggleSell = () => gameInstance?.toggleSellMode();
const startWave = () => gameInstance?.startWave();

const currentBgColor = computed(() => {
  const colors = { 3: '#51323c', 4: '#08141e', 5: '#5e8553', 6: '#494885' };
  return colors[store.currentLevel] || '#346927';
});
</script>

<template>
  <div class="relative w-full h-full flex items-center justify-center overflow-hidden" :style="{ backgroundColor: currentBgColor }">
    
    <div class="relative flex items-center justify-center">
      <canvas ref="canvasRef" @click="gameInstance?.handleCanvasClick($event)" @mousemove="gameInstance?.handleMouseMove($event)" 
              class="block bg-black shadow-2xl rounded-sm"></canvas>

          <button @click="exitToMenu" class="pointer-events-auto px-4 py-2 bg-pink-600 hover:bg-pink-500 border-2 border-white/40 text-[8px] text-white rounded-lg shadow-lg transition-all">
          В МЕНЮ
        </button>

      <!-- ПАНЕЛЬ СТАТИСТИКИ (ОПУЩЕНА НИЖЕ) -->
      <div class="absolute top-20 left-0 right-0 flex justify-between items-start px-4 pointer-events-none z-50">
        <div class="bg-[#3c3c58]/95 border-2 border-pink-400 p-3 rounded-xl shadow-lg flex gap-4">
          <div class="flex flex-col"><span class="text-[7px] text-pink-300">ЗОЛОТО</span><span class="text-white text-xs font-bold">{{ store.money }}</span></div>
          <div class="flex flex-col border-l border-white/20 pl-3"><span class="text-[7px] text-red-400">ЖИЗНИ</span><span class="text-white text-xs font-bold">{{ store.lives }}</span></div>
          <div class="flex flex-col border-l border-white/20 pl-3"><span class="text-[7px] text-blue-400">ВОЛНА</span><span class="text-white text-xs font-bold">{{ store.wave }}</span></div>
          <div class="flex flex-col border-l border-white/20 pl-3"><span class="text-[7px] text-cyan-300">ВРЕМЯ</span><span class="text-white text-xs font-bold">{{ store.gameTime }}с</span></div>
        </div>

        
      </div>

      <!-- МАГАЗИН -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-[#3c3c58]/95 border-2 border-pink-400 rounded-2xl shadow-xl z-40">
        <div v-for="(cfg, type) in TOWER_CONFIG" :key="type">
          <button v-if="store.currentLevel >= (type === 'Флаттершай' ? 2 : type === 'Радуга Дэш' || type === 'Рэрити' ? 3 : type === 'Принцесса Луна' ? 5 : type === 'Дёрпи' ? 6 : 1)"
                  @click="selectTower(type)" 
                  class="w-14 h-14 bg-pink-900/30 hover:bg-pink-500 border-2 border-pink-300/50 rounded-xl flex items-center justify-center transition-all group relative"
                  :class="{'opacity-20 grayscale': store.money < cfg.price}">
            <img :src="getTowerImg(type)" class="w-10 h-10 object-contain" />
            <div class="absolute right-full mr-4 bg-[#3c3c58] border-2 border-pink-400 p-2 rounded-lg hidden group-hover:block w-32 z-50 shadow-2xl">
              <div class="text-[7px] text-pink-200 mb-1 uppercase">{{ type }}</div>
              <div class="text-[8px] text-yellow-300">{{ cfg.price }} 💰</div>
            </div>
          </button>
        </div>
        <button @click="toggleSell" class="w-14 h-14 bg-red-600 hover:bg-red-500 border-2 border-white/20 rounded-xl text-white font-bold text-lg shadow-lg">$</button>
      </div>

      <!-- КНОПКА ВОЛНЫ -->
      <button @click="startWave" class="absolute bottom-16 right-4 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white text-[9px] rounded-xl border-b-4 border-pink-800 active:border-b-0 active:translate-y-1 transition-all z-40 shadow-lg">
        В БОЙ!
      </button>
    </div>

    <!-- ВЫБОР КАРТЫ -->
    <Modal v-if="isLevelModalOpen" @close="isLevelModalOpen = false">
      <template #header><h2 class="text-lg text-pink-300 uppercase font-bold italic">Выберите карту</h2></template>
      <div class="grid grid-cols-2 gap-4">
        <button v-for="l in 6" :key="l" @click="selectLevel(l)" 
                class="flex flex-col items-center p-4 bg-pink-900/20 border-2 border-pink-400 hover:bg-pink-500 rounded-xl transition-all group">
          <span class="text-[10px] text-white font-bold mb-1 uppercase">УРОВЕНЬ {{ l }}</span>
          <span class="text-[7px] text-pink-300 group-hover:text-white uppercase">{{ l === 4 ? 'Ночь' : l === 6 ? 'Империя' : 'Лес' }}</span>
        </button>
      </div>
      <template #footer><div></div></template>
    </Modal>

    <!-- СЮЖЕТНАЯ МОДАЛКА -->
    <Modal v-if="store.activePopup" @close="handleAction">
      <template #header><h2 class="text-[12px] font-bold uppercase text-pink-300 italic tracking-tighter">{{ store.activePopup.title }}</h2></template>
      <div class="flex flex-col items-center gap-4 text-center">
        <div v-if="store.activePopup.imgs" class="flex gap-4">
          <img v-for="image in store.activePopup.imgs" :key="image" :src="`/images/${image}.png`" class="w-16 h-16 object-contain animate-bounce" />
        </div>
        <img v-else-if="store.activePopup.img" :src="`/images/${store.activePopup.img}.png`" class="w-20 h-20 object-contain animate-bounce" />
        <p class="text-[9px] leading-loose text-white tracking-tight px-2" v-html="store.activePopup.text"></p>
      </div>
    </Modal>

    <!-- ПОДСКАЗКА РАДУГИ -->
    <div v-if="store.isPlacingPatrol" class="absolute top-40 left-1/2 -translate-x-1/2 bg-pink-600 border-2 border-white p-3 text-[8px] animate-bounce z-[60] rounded-lg shadow-2xl">
      УСТАНОВИТЕ ВТОРУЮ ТОЧКУ!
    </div>
  </div>
</template>