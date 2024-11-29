<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <!-- Container for the options and form -->
    <div class="flex items-start space-x-8">
      <!-- Left: Exam options -->
      <div class="w-1/3 space-y-4">
        <div
          v-for="tipoExam in TiposExamenes"
          :key="tipoExam.id"
          @click="selectExam(tipoExam.id)"
          :class="[
            'cursor-pointer border rounded-lg p-4 shadow hover:shadow-lg transition',
            selectedExam === tipoExam.id ? 'border-blue-500' : 'border-gray-300',
          ]"
        >
          <!-- Thumbnail -->
          <div class="relative pb-56 bg-gray-200 rounded overflow-hidden">
            <img
              v-if="tipoExam.thumbnail"
              :src="tipoExam.thumbnail"
              alt="Thumbnail"
              class="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          <!-- Title and description -->
          <h2 class="text-lg font-semibold text-blue-600 mt-4">
            {{ tipoExam.nombre || 'Título no disponible' }}
          </h2>
          <p class="text-gray-700 mt-2">
            {{ tipoExam.descripcion || 'Descripción no disponible' }}
          </p>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="bg-white shadow-lg rounded-lg p-6 w-96">
        <h1 class="text-2xl font-bold mb-6 text-center">Generar Exámenes</h1>
        <form @submit.prevent="generateExam">
          <!-- Input for number of questions -->
          <div class="mb-4">
            <label for="nrQuestions" class="block text-gray-700 font-semibold mb-2">Número de Preguntas</label>
            <input
              id="nrQuestions"
              type="number"
              v-model="nrQuestions"
              min="1"
              class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <!-- Input for difficulty -->
          <div class="mb-4">
            <label for="difficulty" class="block text-gray-700 font-semibold mb-2">Dificultad</label>
            <input
              id="difficulty"
              type="number"
              v-model="difficulty"
              min="1"
              max="10"
              class="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <!-- Generate button -->
          <div class="text-center">
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
            >
              Generar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, doc, collection, getDocs, addDoc } from '../firebase/firebaseConfig';

// Reactive variables
const TiposExamenes = ref([]);
const selectedExam = ref(null);
const nrQuestions = ref('');
const difficulty = ref('');
const router = useRouter();
const loading = ref(false);

const min = -25;
const max = 100;

// Fetch exam types from Firebase
const fetchExams = async () => {
  try {
    const examCollection = collection(db, 'tiposExamenes');
    const examSnapshot = await getDocs(examCollection);
    TiposExamenes.value = examSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al cargar los exámenes:', error);
  }
};

// Function to randomly select `n` questions from an array
const getRandomQuestions = (questionsArray, n) => {
  const selected = [];
  const copiedArray = [...questionsArray];

  while (selected.length < n && copiedArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * copiedArray.length);
    selected.push(copiedArray.at(randomIndex));
  }
  return selected;
};

const selectExam = (examId) => {
  selectedExam.value = examId;
};

// Generate exam logic
const generateExam = async () => {
  if (!selectedExam.value || !nrQuestions.value || isNaN(nrQuestions.value)) {
    alert('Por favor, seleccione un examen y proporcione un número válido de preguntas.');
    alert(selectedExam.value + ' ' + nrQuestions.value + ' ' + isNaN(nrQuestions))
    return;
  }

  loading.value = true;

  try {
    // Fetch questions from the selected exam type
    const examDoc = doc(db, 'tiposExamenes', selectedExam.value);
    const questionsSnapshot = await getDocs(collection(examDoc, 'questions'));
    const allQuestions = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Create a new array of questions based on `nrQuestions`
    const newQuestionsArray = getRandomQuestions(allQuestions, parseInt(nrQuestions.value, 10));

    // Save the new array into the "exams" collection
    const newExam = {
      questions: newQuestionsArray,
      difficulty: difficulty.value || 'normal',
      createdAt: new Date().toISOString(),
    };
    console.log(newExam)
    newExam.questions = newExam.questions.map((preg) => {
      const randomizedQuestion = {
        ...preg,
        problema: randomizeNumbers(preg.problema),
      };
      
      if (randomizedQuestion.pregunta) {
        randomizedQuestion.pregunta = randomizeNumbers(randomizedQuestion.pregunta);
      }

      if (preg.tipo === 'opcionmultiple' && preg.opciones) {
        randomizedQuestion.opciones = preg.opciones.map(randomizeNumbers);
      }

      return randomizedQuestion;
    });

    // guarda el nuevo examen y obtiene el id
    const newExamDoc = await addDoc(collection(db, 'exams'), newExam);

    // Redirect to the new exam's view
    router.push(`/exam/${newExamDoc.id}`);
  } catch (error) {
    console.error('Error al generar el examen:', error);
    alert('Hubo un error al generar el examen. Por favor, intente nuevamente.');
  } finally {
    loading.value = false;
  }
};

const randomizeNumbers = (text) => {
  return text.replace(/-?\d+/g, () => generateRandomNumber(min, max));
};

const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Fetch exams when the component mounts
onMounted(() => {
  fetchExams();
});
</script>


<style>
body {
  margin: 0;
  background-color: #f8fafc;
  font-family: Arial, sans-serif;
}
</style>
