<script setup lang="ts">
import { appMetadata } from '@persian-writing/core';
import { messages } from '@persian-writing/i18n';
import SmokeCard from '@persian-writing/ui/SmokeCard.vue';
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-12 text-white" dir="rtl">
    <section class="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
      <SmokeCard
        :title="messages.fa.appName"
        :description="messages.fa.foundationReady"
        :version="appMetadata.version"
      />
    </section>
  </main>
</template>
