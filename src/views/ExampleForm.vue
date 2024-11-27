<template>
  <div class="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white">
    <!-- Preguntas -->
    <div v-if="questions.length">
      <div v-for="question in questions" :key="question.id" class="mb-4">
        <!-- Pregunta -->
        <h2 class="text-lg font-medium mb-2" v-html="question.question"></h2>
         <!-- Expresión LaTeX -->
          <div v-if="question.latex">
            <VueLatex :expression="question.latex" display-mode />
          </div>
        <!-- Respuesta de texto -->
        <div v-if="question.type === 'text'" class="mt-2">
          <textarea
            v-model="responses[question.id]"
            placeholder="Escribe tu respuesta aquí..."
            rows="4"
            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          ></textarea>
        </div>

        <!-- Opción múltiple -->
        <div v-if="question.type === 'multipleChoice'" class="flex flex-col">
          <div
            v-for="option in question.options"
            :key="option"
            class="flex items-center mb-2"
          >
            <input
              type="radio"
              :id="option"
              :value="option"
              v-model="responses[question.id]"
              class="mr-2"
            />
            <label :for="option" class="flex items-center">
              <span v-if="isLatex(option)">
                <VueLatex :expression="option" />
              </span>
              <span v-else v-html="option"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Cargando preguntas -->
    <div v-else>
      <p>Generando examen...</p>
    </div>

    <!-- Botón de enviar -->
    <button
      @click="submitForm"
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring"
    >
      Enviar
    </button>

    <!-- Mensaje -->
    <p v-if="message" class="text-green-600 mt-4">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, doc, getDoc, collection, getDocs } from '../firebase/firebaseConfig';
import { useRoute } from 'vue-router';

// Variables para almacenar el examen y las preguntas
const questions = ref([]);
const responses = ref({});
const message = ref('');

// Función para manejar el envío del formulario
const submitForm = async () => {
  try {
    console.log('Respuestas enviadas:', responses.value);
    message.value = 'Formulario enviado correctamente.';
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    message.value = 'Hubo un error al enviar el formulario.';
  }
};

const isLatex = async (content) => {
  return content.includes("\\b");
}

// Firebase: Obtener el examId desde los parámetros de la ruta
const route = useRoute();
const examId = route.params.examId;

// Cargar preguntas del examen desde Firebase
const fetchExamDetails = async () => {
  try {
    const examDoc = doc(db, 'exams', examId);
    const examSnapshot = await getDoc(examDoc);

    // Cargar las preguntas desde la subcolección 'questions'
    const questionsSnapshot = await getDocs(collection(examDoc, 'questions'));
    questions.value = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Preguntas cargadas:', questions.value);
  } catch (error) {
    console.error('Error al cargar detalles del examen:', error);
  }
};


// Cargar detalles del examen al montar el componente
onMounted(() => {
  // Cargar preguntas
  fetchExamDetails();
});
</script>

<style>
@import "katex/dist/katex.min.css"; /* Importa los estilos de KaTeX */
</style>
