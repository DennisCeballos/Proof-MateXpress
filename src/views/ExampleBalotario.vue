<template>
    <div class="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg bg-white">
        <!-- Download PDF Button -->
        <button @click="downloadPDF"
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring">
            Descargar como PDF
        </button>

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
                    <textarea v-model="responses[question.id]" placeholder="Escribe tu respuesta aquí..." rows="4"
                        class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"></textarea>
                </div>

                <!-- Opción múltiple -->
                <div v-if="question.tipo === 'opcionmultiple'" class="flex flex-col">
                    <div v-for="opcion in question.opciones" :key="opcion" class="flex items-center mb-2">
                        <input type="radio" :id="`${question.id}-${opcion}`" :value="opcion"
                            v-model="responses[question.id]" class="mr-2" />
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
        <button @click="backPage"
            class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring">
            Atrás
        </button>

        -

        <!-- Botón de enviar -->
        <button @click="submitForm"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring">
            Enviar
        </button>

        -

        <button @click="regenarateForm"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring">
            Regenerar examen
        </button>

        <!-- Mensaje -->
        <p v-if="message" class="text-green-600 mt-4">{{ message }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, doc, getDoc, collection, getDocs } from '../firebase/firebaseConfig';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import katex from 'katex';

// Variables para almacenar el examen y las preguntas
const questions = ref([]);
const responses = ref({});
const message = ref('');

const router = useRouter();

const min = -25;
const max = 100;

const downloadPDF = () => {
    window.print();
};

// Helper function to render LaTeX to image using KaTeX
const renderLatexToImage = (latex) => {
    return new Promise((resolve, reject) => {
        // Create a temporary div to render the LaTeX expression
        const element = document.createElement('div');
        element.style.visibility = 'hidden'; // Hide it from the page
        document.body.appendChild(element);

        // Render LaTeX using KaTeX
        katex.render(latex, element, {
            throwOnError: false,
            displayMode: true // Make it a block-level equation (centered)
        });

        // Convert the rendered LaTeX to an image using html2canvas
        html2canvas(element).then((canvas) => {
            document.body.removeChild(element); // Clean up after rendering

            // Convert the canvas to a base64-encoded PNG image
            const imageDataUrl = canvas.toDataURL('image/png');
            resolve(imageDataUrl);
        }).catch(reject);
    });
};


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
    router.push(`/exams`)
};

const regenarateForm = async () => {
    try {
        questions.value = questions.value.map((question) => {
            const randomizedQuestion = {
                ...question,
                question: randomizeNumbers(question.problema),
            };

            if (randomizedQuestion.problema) {
                randomizedQuestion.problema = randomizeNumbers(randomizedQuestion.problema);
            }

            if (question.type === 'opcionmultiple' && question.opciones) {
                randomizedQuestion.opciones = question.opciones.map(randomizeNumbers);
            }

            return randomizedQuestion;
        });
        responses.value = {};
        message.value = 'Examen regenerado correctamente.';
        //console.log('Preguntas regeneradas:', questions.value);
    } catch (error) {
        console.error('Error al regenerar el examen:', error);
        message.value = 'Hubo un error al regenerar el examen.';
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

const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomizeNumbers = (text) => {
    return text.replace(/-?\d+/g, () => generateRandomNumber(min, max));
};

const isLatex = async (content) => {
    return content.includes("\\b");
}

// Firebase: Obtener el examId desde los parámetros de la ruta
const route = useRoute();
const typeId = route.query.typeId;
const nroQuestions = route.query.nroQuestions;
const difficulty = route.query.difficulty;

// Cargar preguntas del examen desde Firebase
const fetchExamDetails = async () => {

    try {
        // Genera un examen de este tipo de examen
        const examDoc = doc(db, 'tiposExamenes', typeId);
        const questionsSnapshot = await getDocs(collection(examDoc, 'questions'));
        const allQuestions = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Create a new array of questions based on `nrQuestions`
        const newQuestionsArray = getRandomQuestions(allQuestions, parseInt(nroQuestions, 10));

        // Save the new array into the "exams" collection
        const newExam = {
            questions: newQuestionsArray,
            difficulty: difficulty,
            createdAt: new Date().toISOString(),
        };

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

        console.log('estas son ')
        console.log(newExam)

        questions.value = newExam.questions;

        console.log('Preguntas cargadas:', randomizedQuestion.value);

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