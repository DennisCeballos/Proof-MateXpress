<template>
  <div class="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white">
    <!-- Preguntas -->
    <div v-if="questions.length">
      <div v-for="question in questions" :key="question.id" class="mb-4">
        <!-- Pregunta -->
        <h2 class="text-lg font-medium mb-2" v-html="question.enunciado"></h2>
         <!-- Expresión LaTeX -->
          <div v-if="question.problema">
            <VueLatex :expression="question.problema" display-mode />
          </div>
        <!-- Respuesta de texto -->
        <div v-if="question.tipo === 'texto'" class="mt-2">
          <textarea
            v-model="responses[question.id]"
            placeholder="Escribe tu respuesta aquí..."
            rows="4"
            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          ></textarea>
        </div>

        <!-- Opción múltiple -->
        <div v-if="question.tipo === 'opcionmultiple'" class="flex flex-col">
          <div
            v-for="opcion in question.opciones"
            :key="opcion"
            class="flex items-center mb-2"
          >
            <input
              type="radio"
              :id="`${question.id}-${opcion}`"
              :value="opcion"
              v-model="responses[question.id]"
              class="mr-2"
            />
            <label :for="`${question.id}-${opcion}`" class="flex items-center">
              <span v-if="isLatex(opcion)">
                <VueLatex :expression="opcion" />
              </span>
              <span v-else v-html="opcion"></span>
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
      @click="backPage"
      class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring"
    >
      Atrás
    </button>

    -

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
import { useRoute, useRouter } from 'vue-router';

// Variables para almacenar el examen y las preguntas
const questions = ref([]);
const responses = ref({});
const message = ref('');

const router = useRouter();
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

const backPage = () => {
  router.push(`/gen-examenes`)
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
    const examSnapshot = await getDoc(examDoc); // Fetch the document

    if (examSnapshot.exists()) {
      // Get the 'questions' field from the document
      const questionsData = examSnapshot.data().questions;

      // Check if questionsData is an array or an object
      if (Array.isArray(questionsData)) {
        questions.value = questionsData.map((question, index) => ({
          id: index.toString(), // Optional: create an id if necessary
          ...question,
        }));
      } else {
        console.error('Questions data is not an array');
      }

      console.log('Preguntas cargadas:', questions.value);
    } else {
      console.error('No exam found with the given ID');
    }
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
  @import "katex/dist/katex.min.css"; 
  body {
    margin: 0;
    overflow: scroll; 
  }
</style>
