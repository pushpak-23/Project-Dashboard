<template>
  <div
    class="min-h-screen w-full grid grid-cols-12 gap-4 p-4 sm:p-6 bg-gradient-to-r from-gray-900 via-indigo-900 to-black"
  >
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="drop drop-1"></div>
      <div class="drop drop-2"></div>
      <div class="drop drop-3"></div>
    </div>
    <!-- LEFT SIDEBAR -->
    <aside class="col-span-12 md:col-span-2 h-full">
      <LeftSidebar class="h-full" />
    </aside>

    <!-- CENTER CONTENT -->
    <main class="col-span-12 md:col-span-8 flex flex-col gap-8">
      <ApplicationLayer />
      <SoftwareLayer />
      <PlatformLayer />
      <InfrastructureCenter />
      <HardwareLayer />
    </main>

    <!-- RIGHT SIDEBAR -->
    <aside class="col-span-12 md:col-span-2 h-full">
      <RightSidebar class="h-full" />
    </aside>
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
