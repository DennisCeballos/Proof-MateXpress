<template>
  <div class="container mx-auto text-center py-10">
    <!-- Title Section -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold">Tu ayuda para estudiar</h1>
      <p class="text-lg mt-2 text-gray-600">y también para enseñar</p>
    </div>

    <!-- Buttons Section -->
    <div class="flex flex-col items-center space-y-4">
      <!-- Study Button -->
      <router-link
        to="/gen-Balotario"
        class="px-6 py-3 bg-purple-300 hover:bg-purple-400 rounded-lg shadow-md text-lg font-medium"
      >
        IR A ESTUDIAR
      </router-link>

      <!-- Teachers Button -->
      <router-link
        to="/login"
        class="px-4 py-2 bg-purple-300 hover:bg-purple-400 rounded-lg shadow-md text-lg font-medium"
      >
        Para profesores
      </router-link>

      <!-- Calculator Button -->
      <router-link
        to="/calculator"
        class="px-4 py-2 bg-purple-300 hover:bg-purple-400 rounded-lg shadow-md text-lg font-medium"
      >
        Calculadora Pro
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No special logic needed here
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
}
</style>
