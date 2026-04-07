<template>
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
    <div class="bg-[#3c3c58] border-4 border-pink-400 rounded-2xl max-w-2xl w-full p-8 shadow-[0_0_30px_rgba(236,72,153,0.3)] relative">
      <div class="absolute -top-3 -left-3 text-2xl">✨</div>
      <div class="absolute -bottom-3 -right-3 text-2xl">✨</div>

      <header class="mb-6 text-center">
        <slot name="header"></slot>
      </header>
      
      <main class="text-white">
        <slot></slot>
      </main>

      <footer class="mt-8">
        <slot name="footer">
          <!-- КНОПКА ТЕПЕРЬ РОЗОВАЯ -->
          <button @click="$emit('close')" class="w-full py-4 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl border-b-4 border-pink-700 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-tighter text-[10px]">
            Продолжить
          </button>
        </slot>
      </footer>
    </div>
  </div>
</template>