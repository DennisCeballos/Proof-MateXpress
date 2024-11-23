
<!-- Componente principal -->
<template>
    <div>
        <!-- Contenedor grid para alinear las matrices fila por fila -->
        <div class="matrices-container">
            <div class="matrix-wrapper">
                <MatrixGridController v-model:matrix="matrixA" class="matriz"/>
            </div>
            <div>
                <MatrixCalculator @operation-done="handleOperation" class="buttons-operations"/>
            </div>
            <div class="matrix-wrapper">
                <MatrixGridController v-model:matrix="matrixB" class="matriz"/>
            </div>
        </div>

        <!-- Solo mostrar el resultado si está presente -->
        <div v-if="resultMatrix">
            <h3>Resultado</h3>
            <MatrixResult :matrix="resultMatrix" readonly/>
        </div>

        <!-- Si hay un error en el cálculo, se muestra -->
        <div v-if="calculationError">
            <p>{{ calculationError }}</p>
        </div>
    </div>
</template>

<script>
import MatrixGridController from '../components/MatrixGridController.vue';
import MatrixCalculator from '../components/MatrixCalculator.vue';
import MatrixResult from '../components/MatrixResult.vue'; // Asegúrate de importar MatrixResult

export default {
    components: { MatrixGridController, MatrixCalculator, MatrixResult },
    data() {
        return {
            matrixA: this.createInitialMatrix(3, 3),
            matrixB: this.createInitialMatrix(3, 3),
            resultMatrix: null,
            calculationError: null,
        };
    },
    methods: {
        createInitialMatrix(rows, cols) {
            return Array.from({ length: rows }, () => Array(cols).fill(0));
        },
        swapMatrices() {
            [this.matrixA, this.matrixB] = [this.matrixB, this.matrixA];
        },
        handleOperation({ result, error }) {
            if (error) {
                this.calculationError = error; // Muestra el mensaje de error si existe
                this.resultMatrix = null; // No muestra un resultado en caso de error
            } else {
                this.calculationError = null; // Limpia el error
                this.resultMatrix = result;  // Asigna el resultado de la operación
            }
        },
    },
};
</script>

<style scoped>
    .matriz {
        display: inline-block;
        background-color: grey;
        padding: 10px;
        border-radius: 5px;
        margin-right: 10px; /* Espacio entre los elementos */
    }

    .matrices-container {
        display: flex;
        justify-content: center; /* Centra las matrices horizontalmente */
        gap: 20px; /* Espacio entre las matrices */
        margin-bottom: 20px; /* Añadir espacio entre las matrices y los botones */
    }

    .matrix-wrapper {
        display: flex;
        justify-content: center; /* Alinea las matrices al centro dentro de sus contenedores */
    }

    .buttons-operations {
        justify-content: center;
    }
</style>
