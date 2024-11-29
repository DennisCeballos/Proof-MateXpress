  <script setup lang="js">
  import { ref, computed, watch, onMounted } from 'vue';
  import * as math from 'mathjs';
  import MatrixInput from '../components/MatrixInput.vue';
  import MatrixSteps from '../components/MatrixSteps.vue';
  import ShareButton from '../components/ShareButton.vue';
  import { decodeState, encodeState } from '../utils/stateManager';

  const matrixA = ref([[0, 0], [0, 0]]);
  const matrixB = ref([[0, 0], [0, 0]]);
  const rowsA = ref(2);
  const colsA = ref(2);
  const rowsB = ref(2);
  const colsB = ref(2);
  const operation = ref('add');
  const result = ref([]);
  const error = ref('');

  const resetMatrix = (rows, cols) => {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
  };

  const loadStateFromHash = () => {
    const hash = window.location.hash;
    console.log(hash);
    if (hash) {
      const state = decodeState(hash);
      if (state) {
        matrixA.value = state.matrixA;
        if (state.matrixB) matrixB.value = state.matrixB;
        operation.value = state.operation;
        rowsA.value = state.rowsA;
        colsA.value = state.colsA;
        rowsB.value = state.rowsB;
        colsB.value = state.colsB;
        calculateResult();
      }
    }
  };

  onMounted(() => {
    loadStateFromHash();
    window.addEventListener('hashchange', loadStateFromHash);

    const section = window.document.getElementById("Resultado");
    section.scrollIntoView()
  });

  const currentState = computed(() => ({
    matrixA: matrixA.value,
    matrixB: matrixB.value,
    operation: operation.value,
    rowsA: rowsA.value,
    colsA: colsA.value,
    rowsB: rowsB.value,
    colsB: colsB.value
  }));

  watch([rowsA, colsA], ([newRows, newCols]) => {
    matrixA.value = resetMatrix(newRows, newCols);
    if (operation.value === 'add' || operation.value === 'subtract') {
      rowsB.value = newRows;
      colsB.value = newCols;
      matrixB.value = resetMatrix(newRows, newCols);
    }
  });

  watch([rowsB, colsB], ([newRows, newCols]) => {
    if (operation.value !== 'add' && operation.value !== 'subtract') {
      matrixB.value = resetMatrix(newRows, newCols);
    }
  });

  watch(operation, (newOp) => {
    if (newOp === 'add' || newOp === 'subtract') {
      rowsB.value = rowsA.value;
      colsB.value = colsA.value;
      matrixB.value = resetMatrix(rowsA.value, colsA.value);
    } else if (newOp === 'multiply') {
      rowsB.value = colsA.value;
      matrixB.value = resetMatrix(rowsB.value, colsB.value);
    }
  });

  const validateMatrix = (matrix) => {
    return matrix.every(row =>
      row.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
    );
  };

  const validateOperation = () => {
    error.value = '';

    if (!validateMatrix(matrixA.value)) {
      error.value = 'La Matriz A contiene números inválidos';
      return false;
    }

    if (showSecondMatrix.value && !validateMatrix(matrixB.value)) {
      error.value = 'La Matriz B contiene números inválidos';
      return false;
    }

    if (['add', 'subtract'].includes(operation.value)) {
      if (rowsA.value !== rowsB.value || colsA.value !== colsB.value) {
        error.value = 'Para suma y resta, las matrices deben tener las mismas dimensiones';
        return false;
      }
    } else if (operation.value === 'multiply') {
      if (colsA.value !== rowsB.value) {
        error.value = 'Para multiplicación, el número de columnas de la Matriz A debe ser igual al número de filas de la Matriz B';
        return false;
      }
    } else if (['determinant', 'inverse'].includes(operation.value)) {
      if (rowsA.value !== colsA.value) {
        error.value = 'Para determinante e inversa, la matriz debe ser cuadrada';
        return false;
      }
    }

    return true;
  };

  const calculateResult = () => {
    if (!validateOperation()) {
      result.value = [];
      return;
    }

    try {
      switch (operation.value) {
        case 'add':
          result.value = math.add(matrixA.value, matrixB.value);
          break;
        case 'subtract':
          result.value = math.subtract(matrixA.value, matrixB.value);
          break;
        case 'multiply':
          result.value = math.multiply(matrixA.value, matrixB.value);
          break;
        case 'determinant':
          const det = math.det(matrixA.value);
          if (typeof det !== 'number' || !isFinite(det)) {
            throw new Error('Cálculo de determinante inválido');
          }
          result.value = [[det]];
          break;
        case 'inverse':
          result.value = math.inv(matrixA.value);
          break;
        case 'transpose':
          result.value = math.transpose(matrixA.value);
          break;
        default:
          throw new Error('Operación inválida');
      }
    } catch (err) {
      error.value = 'Error al realizar el cálculo. Por favor, revise los valores ingresados.';
      result.value = [];
      console.error('Error de cálculo:', err);
    }
  };

  const showSecondMatrix = computed(() =>
    ['add', 'subtract', 'multiply'].includes(operation.value)
  );

  const showSteps = computed(() =>
    ['add', 'subtract', 'multiply', 'determinant'].includes(operation.value)
  );
</script>
  
  <template>
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Calculadora de Matrices</h1>
          <ShareButton :state="currentState" />
        </div>

        <div class="mb-6">
          <label class="block mb-2">Operación:</label>
          <select v-model="operation" class="w-full p-2 border rounded">
            <option value="add">Suma</option>
            <option value="subtract">Resta</option>
            <option value="multiply">Multiplicación</option>
            <option value="determinant">Determinante</option>
            <option value="inverse">Inversa</option>
            <option value="transpose">Transpuesta</option>
          </select>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Matrix A -->
          <div>
            <div class="mb-4 flex gap-4">
              <div>
                <label class="block text-sm">Filas:</label>
                <input type="number" v-model.number="rowsA" min="1" max="10" class="w-20 p-1 border rounded" />
              </div>
              <div>
                <label class="block text-sm">Columnas:</label>
                <input type="number" v-model.number="colsA" min="1" max="10" class="w-20 p-1 border rounded" />
              </div>
            </div>
            <MatrixInput :rows="rowsA" :cols="colsA" label="Matriz A" @update:matrix="matrixA = $event" />
          </div>

          <!-- Matrix B -->
          <div v-if="showSecondMatrix">
            <div class="mb-4 flex gap-4">
              <div>
                <label class="block text-sm">Filas:</label>
                <input type="number" v-model.number="rowsB" min="1" max="10"
                  class="w-20 p-1 border rounded" />
              </div>
              <div>
                <label class="block text-sm">Columnas:</label>
                <input type="number" v-model.number="colsB" min="1" max="10"/>
              </div>
            </div>
            <MatrixInput :rows="rowsB" :cols="colsB" label="Matriz B" @update:matrix="matrixB = $event" />
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>

        <button @click="calculateResult"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-6">
          Calcular
        </button>

        <div id="Resultado">

          <div v-if="result.length" class="mt-8">
            <h3 class="text-lg font-semibold mb-2">Resultado:</h3>
            <div class="grid gap-2">
              <div v-for="(row, i) in result" :key="i" class="flex gap-2">
                <div v-for="(value, j) in row" :key="j"
                  class="w-16 h-12 flex items-center justify-center border rounded bg-gray-50">
                  {{ typeof value === 'number' ? value.toFixed(2) : value }}
                </div>
              </div>
            </div>
          </div>

          <MatrixSteps v-if="showSteps && result.length" :matrix-a="matrixA"
            :matrix-b="showSecondMatrix ? matrixB : undefined" :operation="operation" :result="result" />
        </div>
      </div>
    </div>
  </template>

<style>
  body {
    margin: 0;
    overflow: scroll; 
  }
</style>