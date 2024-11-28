<template>
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">Genera examenes</h1>
  
      <!-- Mensaje mientras se obtienen los exámenes -->
      <p v-if="loading" class="text-center text-gray-500">Obteniendo exámenes...</p>
  
      <!-- Mensaje si no hay exámenes -->
      <p v-else-if="!exams.length" class="text-center text-gray-500">¡No hay exámenes para ti!</p>
  
      <!-- Lista de exámenes -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="exam in exams"
          :key="exam.id"
          @click="goToExam(exam.id)"
          class="cursor-pointer border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition"
        >
          <!-- Contenedor de la miniatura con relación de aspecto fija -->
          <div class="relative pb-56 bg-gray-200 rounded overflow-hidden">
            <img
              v-if="exam.thumbnail"
              :src="exam.thumbnail"
              alt="Thumbnail"
              class="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          <!-- Fallback para título y descripción -->
          <h2 class="text-lg font-semibold text-blue-600 mt-4">
            {{ exam.title || 'Título no disponible' }}
          </h2>
          <p class="text-gray-700 mt-2">
            {{ exam.summary || 'Descripción no disponible' }}
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { db, collection, getDocs } from '../firebase/firebaseConfig';
  import { useRouter } from 'vue-router';
  
  // Variables reactivas
  const exams = ref([]);
  const loading = ref(true);
  const router = useRouter();
  
  // Función para obtener exámenes desde Firebase
  const fetchExams = async () => {
    try {
      const examCollection = collection(db, 'exams');
      const examSnapshot = await getDocs(examCollection);
      exams.value = examSnapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento
        ...doc.data(), // Datos del documento (title, summary, thumbnail)
      }));
      console.log('Exámenes cargados:', exams.value);
    } catch (error) {
      console.error('Error al cargar los exámenes:', error);
    } finally {
      loading.value = false; // Finaliza el estado de carga
    }
  };
  
  // Función para redireccionar al examen
  const goToExam = (examId) => {
    router.push(`/exam/${examId}`);
  };
  
  // Carga de exámenes al montar el componente
  onMounted(() => {
    fetchExams();
  });
  </script>
  
  <style>
  </style>
  