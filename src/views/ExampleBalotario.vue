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
                <div class="mt-2">
                    <p class="font-medium">Respuesta correcta:</p>
                    <div class="flex items-center">
                        <span v-if="isLatex(question.respuestaCorrecta)">
                            <VueLatex :expression="question.respuestaCorrecta" />
                        </span>
                        <span v-else v-html="question.respuestaCorrecta"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cargando preguntas -->
        <div v-else>
            <p>Generando examen...</p>
        </div>

        <!-- Botones -->
        <button @click="backPage"
            class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring">
            Atrás
        </button>
        <!-- Mensaje -->
        <p v-if="message" class="text-green-600 mt-4">{{ message }}</p>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { db, doc, getDoc, collection, getDocs } from '../firebase/firebaseConfig';
import { useRoute, useRouter } from 'vue-router';
import { det, transpose } from 'mathjs';
import { evaluateTex } from 'tex-math-parser'
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
    router.push(`/gen-balotario`)
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
        const examDoc = doc(db, 'tiposExamenes', typeId);
        const questionsSnapshot = await getDocs(collection(examDoc, 'questions'));
        const allQuestions = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const newQuestionsArray = getRandomQuestions(allQuestions, parseInt(nroQuestions, 10));

        const newExam = {
            questions: newQuestionsArray,
            difficulty: difficulty,
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

            if (randomizedQuestion.pregunta) {
                randomizedQuestion.pregunta = randomizeNumbers(randomizedQuestion.pregunta);
            }

            if (preg.problema) {
                let texAnswer;
                const matrix = evaluateTex(randomizedQuestion.problema);
                
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

                randomizedQuestion.respuestaCorrecta = texAnswer || 'Error al calcular';
            }

            return randomizedQuestion;
        });


        questions.value = newExam.questions;

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
@import "katex/dist/katex.min.css";

body {
    margin: 0;
    overflow: scroll;
}
</style>