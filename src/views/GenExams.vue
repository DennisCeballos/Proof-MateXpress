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
  import { det, transpose } from 'mathjs';
  import { evaluateTex } from 'tex-math-parser'

  // Reactive variables
  const TiposExamenes = ref([]);
  const selectedExam = ref(null);
  const nrQuestions = ref('');
  const difficulty = ref('');
  const router = useRouter();
  const loading = ref(false);

  const min = -40;
  const max = 100;

  // Función para obtener preguntas aleatorias
  const getRandomQuestions = (questionsArray, n) => {
    const selected = [];
    const copiedArray = [...questionsArray];

    while (selected.length < n && copiedArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * copiedArray.length);
      selected.push(copiedArray.at(randomIndex));
    }
    return selected;
  };

  // Selección del examen
  const selectExam = (examId) => {
    selectedExam.value = examId;
  };

  // Generar números aleatorios
  const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Reemplazar números con valores aleatorios
  const randomizeNumbers = (text) => {
    return text.replace(/-?\d+/g, () => generateRandomNumber(min, max));
  };

  // Generar el examen
  const generateExam = async () => {
    if (!selectedExam.value || !nrQuestions.value || isNaN(nrQuestions.value)) {
      alert('Por favor, seleccione un examen y proporcione un número válido de preguntas.');
      return;
    }

    loading.value = true;

    try {
      const examDoc = doc(db, 'tiposExamenes', selectedExam.value);
      const questionsSnapshot = await getDocs(collection(examDoc, 'questions'));
      const allQuestions = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newQuestionsArray = getRandomQuestions(allQuestions, parseInt(nrQuestions.value, 10));

      const newExam = {
        questions: newQuestionsArray,
        difficulty: difficulty.value || 'normal',
        createdAt: new Date().toISOString(),
      };

      const convertToLatex = (texAnswer) =>  {
        if (!texAnswer || !texAnswer.evaluated || !texAnswer.evaluated._data) {
          throw new Error("El resultado no contiene datos válidos para convertir a LaTeX");
        }
        const matrixData = texAnswer.evaluated._data;

        const latexMatrix = matrixData
          .map((row) => row.join(" & ")) 
          .join(" \\\\ ");

        return `\\begin{bmatrix}\n${latexMatrix}\n\\end{bmatrix}`;
      }

      newExam.questions = newExam.questions.map((preg) => {
        const randomizedQuestion = {
          ...preg,
          problema: randomizeNumbers(preg.problema),
        };

        if (preg.tipo === 'opcionmultiple') {
          let texAnswer;
          const matrix = evaluateTex(randomizedQuestion.problema);
          console.log(matrix)
          
          if (matrix && matrix.evaluated && matrix.evaluated._data) {
            // Determinante para preguntas 1 y 9
            if (preg.id === 'pregunta1' || preg.id === 'pregunta9') {
              texAnswer = String(det(matrix.evaluated._data));
            } else if (preg.id === 'pregunta2' || preg.id === 'pregunta10') {
              const transposedMatrix = {
                evaluated: {
                  _data: transpose(matrix.evaluated._data)
                }
              };
              texAnswer = convertToLatex(transposedMatrix);
            } else {
              texAnswer = convertToLatex(matrix);
            }
          }

          if (texAnswer !== undefined) {
            let opciones = preg.opciones.map(randomizeNumbers);
            const randomIndex = Math.floor(Math.random() * opciones.length);
            opciones[randomIndex] = texAnswer;
            randomizedQuestion.opciones = opciones;
          } else {
            randomizedQuestion.opciones = preg.opciones.map(randomizeNumbers);
          }
        }

        return randomizedQuestion;
      });

      const newExamDoc = await addDoc(collection(db, 'exams'), newExam);

      router.push(`/exam/${newExamDoc.id}`);
    } catch (error) {
      console.error('Error al generar el examen:', error);
      alert('Hubo un error al generar el examen. Por favor, intente nuevamente.');
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    const examTypesSnapshot = await getDocs(collection(db, 'tiposExamenes'));
    TiposExamenes.value = examTypesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
</script>