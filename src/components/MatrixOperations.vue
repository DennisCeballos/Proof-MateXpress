<template>
    <div>
        <!-- Botones de operaciones -->
        <button @click="performTranspose" class="operation-button">Determinante</button>
        <button @click="performDeterminant" class="operation-button">Transpuesta</button>
        <button @click="performDeterminant" class="operation-button">Multiplicar por </button>
        <button @click="performDeterminant" class="operation-button">Matriz diagonal</button>
        <button @click="performDeterminant" class="operation-button">Matriz inversa</button>
    </div>
    </template>

    <script>
    export default {
    props: {
        matrixA: Array,
        matrixB: Array,
    },
    methods: {
        // Función para transponer la matriz
        performTranspose() {
        const transposedMatrix = this.transposeMatrix(this.matrixA);
        this.$emit("operationPerformed", { operation: "transpose", result: transposedMatrix });
        },
        // Función para calcular el determinante
        performDeterminant() {
        try {
            const determinant = this.calculateDeterminant(this.matrixA);
            this.$emit("operationPerformed", { operation: "determinant", result: determinant });
        } catch (error) {
            this.$emit("operationPerformed", { operation: "determinant", error: error.message });
        }
        },
        // Transponer una matriz
        transposeMatrix(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
        },
        // Calcular el determinante de una matriz 2x2 (simplificado)
        calculateDeterminant(matrix) {
        if (matrix.length === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }
        throw new Error("El determinante solo está soportado para matrices 2x2.");
        },
    },
    };
    </script>

<style scoped>
/* Estilo básico para los botones */
div {
    display: flex;
    flex-direction: column; /* Alinea los botones en una columna */
    justify-content: center; /* Centra los botones verticalmente */
    height: 100%; /* Asegura que el contenedor tenga suficiente espacio para centrar */
}

.operation-button {
    color: white; /* Texto blanco */
    border: 1px solid black; /* Borde negro de 1px */
    padding: 10px 20px; /* Espaciado alrededor del texto */
    text-align: center; /* Centrar el texto */
    text-decoration: none; /* Sin subrayado */
    display: block; /* Para que los botones estén en línea */
    font-size: 16px; /* Tamaño de la fuente */
    margin: 10px 5px; /* Espaciado entre los botones */
    cursor: pointer; /* Cambia el cursor al pasar por encima */
    border-radius: 5px; /* Bordes redondeados */
    transition: background-color 0.3s ease; /* Transición suave para cambio de color */
}


/* Cambiar color al pasar el mouse sobre los botones */
.operation-button:hover {
    background-color: #161734;
}

/* Cambiar color al hacer clic en los botones */
.operation-button:active {
    background-color: #161734;
}
</style>