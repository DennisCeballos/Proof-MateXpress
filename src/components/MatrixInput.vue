<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
    rows: Number,
    cols: Number,
    label: String
});

const emit = defineEmits(['update:matrix']);

// Inicializar la matriz con valores 0
const matrix = ref(
    Array.from({ length: props.rows }, () => Array(props.cols).fill(0))
);

// Actualizar la matriz cuando las dimensiones cambian
watch(
    () => [props.rows, props.cols],
    ([newRows, newCols]) => {
        matrix.value = Array.from({ length: newRows }, () => Array(newCols).fill(0));
    },
    { immediate: true }
);

// Actualizar el valor de la celda
const updateValue = (i, j, value) => {
    const numValue = value === '' ? 0 : Number(value);
    if (!isNaN(numValue)) {
        matrix.value[i][j] = numValue;
        emit('update:matrix', matrix.value); // Emitir el cambio
    }
};
</script>

<template>
    <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">{{ label }}</h3>
        <div class="grid gap-2">
        <!-- Iterar sobre las filas y columnas -->
        <div v-for="i in rows" :key="i" class="flex gap-2">
            <input
            v-for="j in cols"
            :key="j"
            type="number"
            step="any"
            :value="matrix[i - 1][j - 1]"
            @input="(e) => updateValue(i - 1, j - 1, (e.target.value))"
            class="w-16 h-12 text-center border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
        </div>
        </div>
    </div>
</template>
