<script setup>
import { computed } from 'vue';
import {
    generateAdditionSteps,
    generateSubtractionSteps,
    generateMultiplicationSteps,
    generateDeterminantSteps,
    generateTransposeSteps,
    generateInverseSteps
    } from '../utils/matrixOperations';

    const props = defineProps({
    matrixA: Array,
    matrixB: Array,
    operation: String,
    result: Array
    });

    const steps = computed(() => {
    if (!props.result.length) return [];

    switch (props.operation) {
        case 'add':
        return generateAdditionSteps(props.matrixA, props.matrixB, props.result);
        case 'subtract':
        return generateSubtractionSteps(props.matrixA, props.matrixB, props.result);
        case 'multiply':
        return generateMultiplicationSteps(props.matrixA, props.matrixB, props.result);
        case 'determinant':
        return generateDeterminantSteps(props.matrixA);
        case 'transpose':
        return generateTransposeSteps(props.matrixA, props.result);
        case 'inverse':
        return generateInverseSteps(props.matrixA, props.result);
        default:
        return [];
    }
    });

    const isHighlighted = (step, matrix, row, col) => {
    if (!step.highlightCells) return false;

    return step.highlightCells.some((cell) => {
        if (cell.matrix !== matrix) return false;

        // Check specific row/col
        if (cell.row !== undefined && cell.col !== undefined) {
        return cell.row === row && cell.col === col;
        }

        // Check row with multiple columns
        if (cell.row !== undefined && cell.cols) {
        return cell.row === row && cell.cols.includes(col);
        }

        // Check column with multiple rows
        if (cell.col !== undefined && cell.rows) {
        return cell.col === col && cell.rows.includes(row);
        }

        return false;
    });
    };
    </script>

    <template>
    <div v-if="steps.length" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-semibold mb-3">Solución Paso a Paso:</h3>
        
        <div class="space-y-6">
        <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="p-4 bg-white rounded shadow-sm"
        >
            <!-- Step header -->
            <div v-if="step.position" class="font-medium text-gray-700 mb-2">
            Paso {{ index + 1 }}: Calculando posición {{ step.position }}
            </div>
            
            <div v-if="step.explanation" class="font-medium text-gray-700 mb-2">
            {{ step.explanation }}
            </div>

            <!-- Matrix visualization -->
            <div class="flex items-center justify-center gap-4 flex-wrap mb-3">
            <!-- Matrix A -->
            <div class="flex flex-col items-center">
                <span class="text-sm text-gray-500 mb-1">Matriz A</span>
                <div class="relative">
                <div class="absolute -left-2 top-0 bottom-0 border-l-2 border-t-2 border-b-2 border-gray-400 w-2"></div>
                <div class="px-4 py-2">
                    <div 
                    v-for="(row, i) in matrixA" 
                    :key="i"
                    class="flex gap-4"
                    >
                    <div 
                        v-for="(value, j) in row" 
                        :key="j"
                        :class="[ 
                        'w-12 h-8 flex items-center justify-center transition-colors',
                        isHighlighted(step, 'A', i, j) ? 'bg-blue-100' : ''
                        ]"
                    >
                        {{ typeof value === 'number' ? value.toFixed(2) : value }}
                    </div>
                    </div>
                </div>
                <div class="absolute -right-2 top-0 bottom-0 border-r-2 border-t-2 border-b-2 border-gray-400 w-2"></div>
                </div>
            </div>

            <!-- Operator -->
            <div v-if="matrixB" class="text-2xl font-bold text-gray-600">
                {{ operation === 'add' ? '+' : operation === 'subtract' ? '-' : '×' }}
            </div>

            <!-- Matrix B -->
            <div v-if="matrixB" class="flex flex-col items-center">
                <span class="text-sm text-gray-500 mb-1">Matriz B</span>
                <div class="relative">
                <div class="absolute -left-2 top-0 bottom-0 border-l-2 border-t-2 border-b-2 border-gray-400 w-2"></div>
                <div class="px-4 py-2">
                    <div 
                    v-for="(row, i) in matrixB" 
                    :key="i"
                    class="flex gap-4"
                    >
                    <div 
                        v-for="(value, j) in row" 
                        :key="j"
                        :class="[ 
                        'w-12 h-8 flex items-center justify-center transition-colors',
                        isHighlighted(step, 'B', i, j) ? 'bg-blue-100' : ''
                        ]"
                    >
                        {{ typeof value === 'number' ? value.toFixed(2) : value }}
                    </div>
                    </div>
                </div>
                <div class="absolute -right-2 top-0 bottom-0 border-r-2 border-t-2 border-b-2 border-gray-400 w-2"></div>
                </div>
            </div>

            <!-- Equals sign -->
            <div class="text-2xl font-bold text-gray-600">=</div>

            <!-- Result -->
            <div class="flex flex-col items-center">
                <span class="text-sm text-gray-500 mb-1">Resultado</span>
                <div class="relative">
                <div class="absolute -left-2 top-0 bottom-0 border-l-2 border-t-2 border-b-2 border-gray-400 w-2"></div>
                <div class="px-4 py-2">
                    <div 
                    v-for="(row, i) in result" 
                    :key="i"
                    class="flex gap-4"
                    >
                    <div 
                        v-for="(value, j) in row" 
                        :key="j"
                        :class="[ 
                        'w-12 h-8 flex items-center justify-center transition-colors',
                        isHighlighted(step, 'result', i, j) ? 'bg-green-100' : ''
                        ]"
                    >
                        {{ typeof value === 'number' ? value.toFixed(2) : value }}
                    </div>
                    </div>
                </div>
                <div class="absolute -right-2 top-0 bottom-0 border-r-2 border-t-2 border-b-2 border-gray-400 w-2"></div>
                </div>
            </div>
            </div>

            <!-- Calculation details -->
            <div v-if="step.calculation" class="mt-3 p-2 bg-gray-50 rounded font-mono text-sm">
            {{ step.calculation }}
            <span v-if="step.result" class="font-bold">{{ step.result }}</span>
            </div>

            <!-- Original and transposed positions for transpose operation -->
            <div v-if="step.original && step.transposed" class="mt-3 p-2 bg-gray-50 rounded font-mono text-sm">
            <div>Original: {{ step.original }}</div>
            <div>Transpuesta: {{ step.transposed }}</div>
            </div>

            <!-- Nested steps for determinant and inverse -->
            <div v-if="step.detSteps" class="mt-3">
            <div v-for="(detStep, dIndex) in step.detSteps" :key="dIndex" class="ml-4 mt-2">
                <div class="text-sm text-gray-600">{{ detStep.explanation }}</div>
                <div class="font-mono text-sm mt-1">{{ detStep.calculation }}</div>
            </div>
            </div>

            <div v-if="step.subSteps" class="mt-3">
            <div v-for="(subStep, sIndex) in step.subSteps" :key="sIndex" class="ml-4 mt-2">
                <div v-if="subStep.position" class="text-sm text-gray-600">
                Posición {{ subStep.position }}:
                </div>
                <div class="font-mono text-sm mt-1">
                {{ subStep.original }} → {{ subStep.result }}
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
</template>
