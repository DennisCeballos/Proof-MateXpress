<template>
    <div class="matrix-container">
        <!-- Tabla de la matriz -->
        <table class="matrix-table">
        <img src="../assets/Matrix/abrir-parentesis.png" alt="" class="parenthesis">
        <tbody>
            <!-- Fila de control para eliminar/agregar columnas -->
            <tr v-if="!readonly">
                <td></td>
                <template v-for="(col, colIndex) in matrix[0]" :key="'col-'+colIndex">
                    <td @click="removeColumn(colIndex)" class="control-cell">-</td>
                </template>
                <td></td>
            </tr>
            
            <!-- Fila con las celdas de la matriz y control de eliminar fila -->
            <tr v-for="(row, rowIndex) in matrix" :key="'row-'+rowIndex">
                <td v-if="!readonly" @click="removeRow(rowIndex)" class="control-cell">-</td>
                <template v-for="(col, colIndex) in row" :key="'cell-'+rowIndex+'-'+colIndex">
                    <td>
                        <input v-if="!readonly" v-model="matrix[rowIndex][colIndex]" class="matrix-cell">
                        <span v-else>{{ col }}</span>
                    </td>
                </template>
            </tr>

            <!-- Fila de control para añadir filas y columnas -->
            <tr v-if="!readonly">
                <td @click="expandMatrixRows" colspan="1" class="control-cell">+</td> <!-- Botón "+" para añadir fila -->
                <template v-for="(col, colIndex) in matrix[0]" :key="'add-col-'+colIndex">
                    <td></td> <!-- Celdas vacías en el centro para alinear el botón "+" de columna -->
                </template>
                <td @click="expandMatrixCols" class="control-cell">+</td> <!-- Botón "+" para añadir columna -->
            </tr>
        </tbody>

        <img src="../assets/Matrix/cerrar-parentesis.png" alt="" class="parenthesis">
        </table>

        <!-- Componente fuera de la tabla, debajo de la matriz -->
        <div class="button-container">
            <MatrixOperations />
        </div>
    </div>
</template>

<script>
import MatrixOperations from '../components/MatrixOperations.vue';

export default {
    components: {
        MatrixOperations
    },
    props: {
        matrix: {
            type: Array,
            required: true
        },
        readonly: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:matrix'],
    methods: {
        updateMatrix() {
            this.$emit('update:matrix', this.matrix);
        },
        expandMatrixRows() {
            this.matrix.push(Array(this.matrix[0].length).fill(0));
            this.updateMatrix();
        },
        expandMatrixCols() {
            this.matrix.forEach(row => row.push(0));
            this.updateMatrix();
        },
        removeRow(index) {
            this.matrix.splice(index, 1);
            this.updateMatrix();
        },
        removeColumn(index) {
            this.matrix.forEach(row => row.splice(index, 1));
            this.updateMatrix();
        },
    }
};
</script>

<style scoped>
.matrix-container {
    display: flex;
    align-items: stretch; /* Alinea las imágenes a la altura de la tabla */
    justify-content: center; /* Centra la tabla y las imágenes en el contenedor */
    gap: 0; /* Elimina cualquier espacio entre la tabla y los paréntesis */
    margin-bottom: 20px;
}

.matrix-table {
    margin: 0 10px; /* Espaciado a los lados de la tabla */
    border-collapse: collapse;
    display: inline-flex;
}

.matrix-cell {
    border: 5px solid #ddd;
    padding: 10px;
    text-align: center;
    width: 50px;
    height: 50px;
}

.button-container {
    display: block;
    margin-top: 20px;
    text-align: center;
}

.parenthesis {
    height: auto;
    align-self: stretch; /* Ajusta la altura de las imágenes al contenido de la matriz */
}

.expand-control {
    padding: 0; /* Quita el padding extra */
}

</style>
