import { Entries } from "@/types/entries.model";
import { ref } from "vue";

/* const calcURL = 'https://calcdata.tset.com'; */

const tsetForm = ref<Entries>();

async function fetchFormData() {
/*     const response = await fetch('${calcURL}');
    tsetForm.value = await response.json(); */
    tsetForm.value = [
        {
            label : 'Baseprice',
            value : 1
        }
    ]
}


export function useData() {
    return {
        tsetForm,
        fetchFormData
    }
}