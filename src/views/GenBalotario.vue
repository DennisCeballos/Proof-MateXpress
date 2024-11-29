<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <!-- Container for the options and form -->
    <div class="flex items-start space-x-8">
      <!-- Left: Exam options -->
      <div class="w-1/3 space-y-4">
        <!-- Skeleton loader for loading state -->
        <div v-if="loading" class="space-y-4">
          <!-- Skeleton item -->
          <div class="animate-pulse cursor-pointer border rounded-lg p-4 shadow bg-gray-200">
            <div class="relative pb-56 bg-gray-300 rounded overflow-hidden"></div>
            <div class="h-4 bg-gray-400 mt-4 w-3/4 rounded"></div>
            <div class="h-3 bg-gray-300 mt-2 w-5/6 rounded"></div>
          </div>
          <div class="animate-pulse cursor-pointer border rounded-lg p-4 shadow bg-gray-200">
            <div class="relative pb-56 bg-gray-300 rounded overflow-hidden"></div>
            <div class="h-4 bg-gray-400 mt-4 w-3/4 rounded"></div>
            <div class="h-3 bg-gray-300 mt-2 w-5/6 rounded"></div>
          </div>
          <!-- Add as many skeleton items as you want for the placeholder -->
        </div>

        <!-- Actual exam options once data is loaded -->
        <div v-else>
          <div
            v-for="tipoExam in TiposExamenes"
            :key="tipoExam.id"
            @click="selectExam(tipoExam.id)"
            :class="[ 'cursor-pointer border rounded-lg p-4 shadow hover:shadow-lg transition', selectedExam === tipoExam.id ? 'border-blue-500' : 'border-gray-300']"
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
      </div>

      <!-- Right: Form -->
      <div class="bg-white shadow-lg rounded-lg p-6 w-96">
        <h1 class="text-2xl font-bold mb-6 text-center">Generar Balotario de preguntas</h1>
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
  loading.value = true;  // Start loading

  try {
    const examCollection = collection(db, 'tiposExamenes');
    const examSnapshot = await getDocs(examCollection);
    TiposExamenes.value = examSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al cargar los exámenes:', error);
  } finally {
    loading.value = false;  // End loading
  }
};

const selectExam = (examId) => {
  selectedExam.value = examId;
};

// Generate exam logic
const generateExam = async () => {
  if (!selectedExam.value || !nrQuestions.value || isNaN(nrQuestions.value)) {
    alert('Por favor, seleccione un examen y proporcione un número válido de preguntas.');
    return;
  }

  loading.value = true;

  try {
    // Redirect to the new exam's view
    router.push({
      path: '/practicar',
      query: {
        typeId: selectedExam.value,
        nroQuestions: nrQuestions.value,
        difficulty: difficulty.value,
      },
    });

  } catch (error) {
    console.error('Error al generar el examen:', error);
    alert('Hubo un error al generar el examen. Por favor, intente nuevamente.');
  } finally {
    loading.value = false;
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
