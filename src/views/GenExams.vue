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
import { add, det, subtract, transpose, multiply } from 'mathjs'
import 'latex-to-js'

// Reactive variables
const TiposExamenes = ref([]);
const selectedExam = ref(null);
const nrQuestions = ref('');
const difficulty = ref('');
const router = useRouter();
const loading = ref(false);

const min = -25;
const max = 100;

// hardcodeando all day
const operationMap = {
  'pregunta3': 'sum_array',
  'pregunta4': 'sum_array',
  'pregunta2': 'trans_array',
  'pregunta1': 'det_array',
  'pregunta5': 'res_array',
  'pregunta6': 'res_array',
  'pregunta9': 'det_array',
  'pregunta10': 'trans_array',
  'pregunta7': 'mult_array',
  'pregunta8': 'mult_array'
};

const findArrayByQuestion = (question) => {
  return operationMap[question] || 'none';
};

const calculateMatrixOperation = (matrices, operationId) => {
  if (!Array.isArray(matrices) || matrices.length === 0) {
    console.error("No se proporcionaron matrices.");
    return null;
  }

  // Verifica si hay más de una matriz cuando se requiere
  if ((operationId !== 'trans_array' 
    || operationId !== 'det_array' 
  ) 
  && matrices.length !== 2) {
    console.error("Se requieren exactamente dos matrices para esta operación.");
    return null;
  }

  let result;

  switch (operationId) {
    case 'sum_array':
      result = add(matrices[0], matrices[1]);
      break;
    case 'res_array':
      result = subtract(matrices[0], matrices[1]);
      break;
    case 'mult_array':
      result = multiply(matrices[0], matrices[1]);
      break;
    case 'det_array':
      if (matrices.length === 1) {
        result = det(matrices[0]);
      } else {
        console.error("El determinante solo puede ser calculado para una matriz.");
        return null;
      }
      break;
    case 'trans_array':
      result = transpose(matrices[0]);
      break;
    default:
      console.error("Operación no soportada.");
      return null;
  }
  
  if (Array.isArray(result)) {
    return math.matrix(result).toTex();
  } else {
    return result.toString();
  }
};

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
        // a atacar
        /*
          Quiero:
           - Convertir las matrices de latex a js, en caso haya mas de una separarlas, maximo hay 2
           - usar mathjs para operar
           - convertir el resultado a latex de nuevo
           - En el rango de las opciones antiguas, poner la nueva
           - listo
        */
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

const latexToMathJsObject = (latexExpression) => {
  if (!latexExpression || typeof latexExpression !== 'string') {
    throw new Error('Invalid LaTeX expression');
  }

  try {
    const parsed = latexToJs.parse(latexExpression);

    if (parsed.type === 'Matrix') {
      const matrixData = parsed.elements.map((row) =>
        row.map((element) => math.evaluate(element.toString()))
      );
      return math.matrix(matrixData); 
    }

    if (parsed.type === 'Expression') {
      return parsed.toString();
    }

    throw new Error('Unsupported LaTeX structure');
  } catch (error) {
    console.error('Error parsing LaTeX:', error);
    throw new Error('Failed to convert LaTeX to Math.js object');
  }
};

const separateMatrices = (problem) => {
  if (!problem) {
    console.error("Problem is null or undefined!");
    return [];
  }
  const matrixRegex = /\\begin\{bmatrix\}[\s\S]*?\\end\{bmatrix\}/g;

  const matrices = problem.match(matrixRegex);

  if (!matrices) {
    console.error("Error, no hay matrices!");
    return [];
  }
  console.log(matrices);
  return matrices;
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
    overflow: scroll; 
  }
</style>
