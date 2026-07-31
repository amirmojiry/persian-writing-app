<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  version: string;
}>();
</script>

<template>
  <article class="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
    <p class="mb-4 text-sm font-semibold tracking-widest text-violet-300">MILESTONE 0</p>
    <h1 class="text-4xl font-black sm:text-6xl">{{ title }}</h1>
    <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">{{ description }}</p>
    <p class="mt-8 text-sm text-slate-400">نسخه {{ version }}</p>
  </article>
</template>
