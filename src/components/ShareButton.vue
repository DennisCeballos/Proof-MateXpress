<script setup>
import { ref } from 'vue';
import { getShareableLink } from '../utils/stateManager';

const props = defineProps({
    state: Object
    });

    const copied = ref(false);

    const copyLink = async () => {
    const link = getShareableLink(props.state);
    console.log(props.state)
    await navigator.clipboard.writeText(link);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2000);
    };
    </script>

    <template>
    <button
        @click="copyLink"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
    >
        <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        >
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        {{ copied ? '¡Enlace Copiado!' : 'Compartir' }}
    </button>
</template>
