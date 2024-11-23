<template>
        <div class="operations-container">
            <button class="swap-btn" @click="swapMatrices">Intercambiar</button>
            <button class="sum-btn" @click="sumMatrices">Sumar</button>
            <button class="subtract-btn" @click="subtractMatrices">Restar</button>
            <button class="multiply-btn" @click="multiplyMatrices">Multiplicar</button>
        </div>
</template>

<script>
    export default {
        props: {
            matrixA: {
                type: Array,
                required: true,
            },
            matrixB: {
                type: Array,
                required: true,
            }
        },
        methods: {
            // Intercambiar matrices
            swapMatrices() {
                [this.matrixA, this.matrixB] = [this.matrixB, this.matrixA];
                this.$emit('operation-done', { operation: 'swap', result: [this.matrixA, this.matrixB] });
            },
            // Sumar matrices
            sumMatrices() {
                if (this.matrixA.length !== this.matrixB.length || this.matrixA[0].length !== this.matrixB[0].length) {
                    this.$emit('operation-done', { error: 'Las matrices deben tener las mismas dimensiones para sumar.' });
                } else {
                    const result = this.matrixA.map((row, i) =>
                        row.map((val, j) => val + this.matrixB[i][j])
                    );
                    this.$emit('operation-done', { operation: 'sum', result });
                }
            },
            // Restar matrices
            subtractMatrices() {
                if (this.matrixA.length !== this.matrixB.length || this.matrixA[0].length !== this.matrixB[0].length) {
                    this.$emit('operation-done', { error: 'Las matrices deben tener las mismas dimensiones para restar.' });
                } else {
                    const result = this.matrixA.map((row, i) =>
                        row.map((val, j) => val - this.matrixB[i][j])
                    );
                    this.$emit('operation-done', { operation: 'subtract', result });
                }
            },
            // Multiplicar matrices
            multiplyMatrices() {
                if (this.matrixA[0].length !== this.matrixB.length) {
                    this.$emit('operation-done', { error: 'El número de columnas de la primera matriz debe ser igual al número de filas de la segunda matriz para multiplicar.' });
                } else {
                    const result = this.matrixA.map((row, i) =>
                        this.matrixB[0].map((_, j) =>
                            row.reduce((sum, val, k) => sum + val * this.matrixB[k][j], 0)
                        )
                    );
                    this.$emit('operation-done', { operation: 'multiply', result });
                }
            }
        }
    };
</script>

<style scoped>
    /* Estilo de botones de operación */
    .operations-container {
        display: inline-flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
        flex-direction: column;
    }

    button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .swap-btn {
        background-color: #4CAF50;
        color: white;
    }

    .swap-btn:hover {
        background-color: #45a049;
    }

    .sum-btn {
        background-color: #008CBA;
        color: white;
    }

    .sum-btn:hover {
        background-color: #007bb5;
    }

    .subtract-btn {
        background-color: #f44336;
        color: white;
    }

    .subtract-btn:hover {
        background-color: #e02e1b;
    }

    .multiply-btn {
        background-color: #ff9800;
        color: white;
    }

    .multiply-btn:hover {
        background-color: #e68900;
    }
</style>
