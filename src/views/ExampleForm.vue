<template>
  <div class="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white">

    <!-- Cargando las preguntas -->
    <div v-if="questions.length">
      <div v-for="question in questions" :key="question.id" class="mb-4">
        <h2 class="text-lg font-medium mb-2">{{ question.question }}</h2>

        <!-- Opción múltiple -->
        <div v-if="question.type === 'multipleChoice'" class="flex flex-col">
          <div v-for="option in question.options" :key="option" class="flex items-center mb-2">
            <input
              type="radio"
              :id="option"
              :value="option"
              v-model="responses[question.id]"
              class="mr-2"
            />
            <label :for="option">{{ option }}</label>
          </div>
        </div>

        <!-- Respuesta de texto -->
        <div v-else-if="question.type === 'text'" class="mt-2">
          <textarea
            v-model="responses[question.id]"
            placeholder="Escribe tu respuesta aquí..."
            rows="4"
            class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Mensaje mientras cargan las preguntas -->
    <div v-else>
      <p>Loading questions...</p>
    </div>

    <!-- Botón de Enviar -->
    <button
      @click="submitForm"
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring"
    >
      Enviar
    </button>

    <!-- Mensaje de éxito o error -->
    <p v-if="message" class="text-green-600 mt-4">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, doc, getDoc,  collection, getDocs } from '../firebase/firebaseConfig'
import { useRoute } from 'vue-router'

// Obtener el examId desde los parámetros de la ruta
const route = useRoute()
const examId = route.params.examId

// Variables para almacenar el examen y las preguntas
const exam = ref(null)
const questions = ref([])
const responses = ref({})
const message = '';

// Función para obtener las preguntas del examen
const fetchExamDetails = async () => {
  try {
    // Cargar el examen desde la colección 'exams' usando el examId
    const examDoc = doc(db, 'exams', examId)
    const examSnapshot = await getDoc(examDoc)
    exam.value = examSnapshot.data()

    // Cargar las preguntas del examen desde la subcolección 'questions'
    const questionsSnapshot = await getDocs(collection(examDoc, 'questions'))
    questions.value = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading exam details:', error)
  }
}

// Función para manejar el envío del formulario
const submitForm = async () => {
  try {
    // Aquí puedes procesar las respuestas, por ejemplo, enviándolas a Firestore
    console.log('Respuestas enviadas:', responses.value)
    message.value = 'Formulario enviado correctamente.'
  } catch (error) {
    console.error('Error submitting form:', error)
    message.value = 'Hubo un error al enviar el formulario.'
  }
}

// Cargar los detalles del examen cuando el componente se monte
onMounted(() => {
  fetchExamDetails()
})
</script>

<style scoped>
/* Estilos del formulario */
</style>
