<template>
  <div
    class="relative isolate min-h-screen w-full overflow-x-hidden bg-linear-to-r from-gray-900 via-indigo-900 to-black px-3 py-4 sm:px-6 sm:py-6"
  >
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="drop drop-1"></div>
      <div class="drop drop-2"></div>
      <div class="drop drop-3"></div>
    </div>
    <div class="mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)_300px] xl:items-start">
      <!-- LEFT SIDEBAR -->
      <aside class="h-full xl:sticky xl:top-6 xl:self-start">
        <LeftSidebar class="h-full" />
      </aside>

      <!-- CENTER CONTENT -->
      <main class="min-w-0 flex flex-col gap-6">
        <ApplicationLayer />
        <SoftwareLayer />
        <PlatformLayer />
        <InfrastructureCenter />
        <HardwareLayer />
      </main>

      <!-- RIGHT SIDEBAR -->
      <aside class="h-full xl:sticky xl:top-6 xl:self-start">
        <RightSidebar class="h-full" />
      </aside>
    </div>
  </div>
</template>

<script setup>
import LeftSidebar from "../components/LeftSidebar.vue";
import RightSidebar from "../components/RightSidebar.vue";
import InfrastructureCenter from "../components/InfrastructureCenter.vue";
import HardwareLayer from "../components/HardwareLayer.vue";
import PlatformLayer from "../components/PlatformLayer.vue";
import SoftwareLayer from "../components/SoftwareLayer.vue";
import ApplicationLayer from "../components/ApplicationLayer.vue";
</script>

<style scoped>
/* Dark gradient background */
body {
  background: linear-gradient(
    to right,
    #1e1e1e,
    #2c2c6c,
    #000000
  ); /* Deep gray to indigo to black */
}

.min-h-screen {
  background: linear-gradient(to right, #1e1e1e, #2c2c6c, #000000);
}
</style>
