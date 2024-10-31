<template>
  <div class="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white">
    <h1 class="text-2xl font-semibold mb-4">Formulario</h1>

    <!-- Pregunta 1: Opciones Múltiples -->
    <div>
      <h2 class="text-lg font-medium mb-2">¿Cuáles de las siguientes opciones prefieres?</h2>
      <div v-for="(option, index) in options" :key="index" class="flex items-center mb-2">
        <input
          type="checkbox"
          :id="'option-' + index"
          :value="option"
          v-model="selectedOptions"
          class="mr-2"
        />
        <label :for="'option-' + index">{{ option }}</label>
      </div>
    </div>

    <!-- Pregunta 2: Respuesta abierta -->
    <div class="mt-4">
      <h2 class="text-lg font-medium mb-2">¿Algún comentario adicional?</h2>
      <textarea
        v-model="textAnswer"
        placeholder="Escribe tu respuesta aquí..."
        rows="4"
        class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
      ></textarea>
    </div>

    <!-- Botón de Enviar -->
    <button
      @click="submitForm"
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring"
    >
      Enviar
    </button>

    <!-- Muestra el mensaje después de enviar -->
    <p v-if="message" class="text-green-600 mt-4">{{ message }}</p>
  </div>
</template>

<script>
import useForm from '../assets/js/fireBaseSentResponses.js';

export default {
  setup() {
    return useForm();
  }
};
</script>