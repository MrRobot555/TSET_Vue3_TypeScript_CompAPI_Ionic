import { Entries } from "@/types/entries.model";
import { ref } from "vue";

/* const calcURL = 'https://calcdata.tsed.com'; */

const tsedForm = ref<Entries>();

async function fetchFormData() {
/*     const response = await fetch('${calcURL}');
    tsedForm.value = await response.json(); */
    tsedForm.value = [
        {
            label : 'Baseprice',
            value : 1
        }
    ]
}


export function useData() {
    return {
        tsedForm,
        fetchFormData
    }
}