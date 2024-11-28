<template>
  <div class="h-screen bg-white text-black flex items-center justify-center overflow-hidden">
    <!-- Contenedor principal -->
    <div class="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-24 space-y-12 lg:space-y-0 px-4">
      <!-- Sección del título -->
      <div class="text-center lg:text-left">
        <h1 class="text-purple-600 text-5xl sm:text-6xl lg:text-7xl font-extrabold">
          MateXpress
        </h1>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-4">
          Tu ayuda para estudiar
        </h1>
        <p class="text-gray-600 mt-4 text-lg sm:text-xl lg:text-2xl">
          y también para enseñar
        </p>
      </div>

      <!-- Sección de los botones -->
      <div class="flex flex-col space-y-4 sm:space-y-6 items-center lg:items-start">
        <button
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 sm:py-5 px-8 sm:px-10 rounded-xl text-lg sm:text-2xl shadow-lg"
        >
          IR A ESTUDIAR
        </button>
        <button
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 sm:py-5 px-8 sm:px-10 rounded-xl text-lg sm:text-2xl shadow-lg"
        >
          Para profesores
        </button>
        <button
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 sm:py-5 px-8 sm:px-10 rounded-xl text-lg sm:text-2xl shadow-lg"
        >
          Calculadora Pro
        </button>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  overflow: hidden; 
}
</style>
