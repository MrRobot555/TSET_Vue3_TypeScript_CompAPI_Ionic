<template>
    <div>
     <ion-grid>
         <ion-row>
            <ion-col size="4" class="ion-align-self-center" offset="4">
                <div class="main">
                    <div class="main-title"><h2>Price Components</h2></div>
                    <ion-row
                        class="ion-margin"
                    >
                        <ion-col
                            class="ion-text-end"
                        >
                        <h2>Total: {{tsetFormatted(total)}} EUR/Kg</h2>
                        </ion-col>
                    </ion-row>
                    <ion-row v-for="(element, index) in tsetForm" 
                        :key="index"
                        class="ion-align-items-center ion-padding-start"
                        :class="{'isSelected': frontEnd.hovered === index}"
                        @mouseover="frontEnd.hovered = index"
                        @mouseleave="frontEnd.hovered = -1"
                    >
                        <div v-if="(frontEnd.hovered === index && index > 0)"
                            class="tset-icon erase clickable"
                            @click="deletion(index)"
                        >
                            <ion-icon
                                class="icon-inner"
                                :icon="closeCircle.ios"
                            ></ion-icon>
                        </div>
                        <ion-col size="6" >
                            <template v-if="frontEnd.editMode === index">
                                <ion-input
                                    :ref="el => { domRefs[index.toString()+'-label'] = el }"
                                    @blur="frontEnd.editMode = -1"
                                    @change="labelEdit(index, $event)"
                                    type="text"
                                    class="ion-text-start ion-padding-end"
                                    :value="element.label"
                                    :id="index.toString()+'-label'"
                                    autocomplete="off"
                                    >
                                </ion-input>
                            </template>
                            <template v-else>

                                    <div
                                        class="unbordered ion-text-start ellipsis"
                                        @mouseover="frontEnd.showEditIcon = index"
                                        @mouseleave="frontEnd.showEditIcon = -1"
                                        :id="index+'-label'"
                                        tooltip="{{ element.label }}"
                                    >
                                        <div 
                                            v-if="frontEnd.showEditIcon === index  && index > 0"
                                            class="clickable tset-icon edit"
                                            @click="switchToEdit(index, $event)"
                                        > 
                                            <ion-icon 
                                                :icon="create.ios"
                                                class="icon-inner"
                                            ></ion-icon>
                                        </div>
                                        {{element.label}}
                                    </div>

                            </template>
                        </ion-col>
                        <ion-col size="6">
                            <ion-input
                                :ref="el => { domRefs[index.toString()+'-value'] = el }"
                                @ionFocus="frontEnd.focusedValue = index"
                                @ionBlur="frontEnd.editMode = -1; frontEnd.focusedValue = -1"
                                @ionChange="frontEnd.editMode = -1"
                                type = "number"
                                inputmode = "decimal"
                                class="ion-text-end ion-padding-end input-style" 
                                :value="valueSet[index]"
                                @ionInput="dataBack(index, $event)"
                                :id="index.toString()"
                                autocomplete="off"
                                placeholder="0.0"
                                @keyup="forbidden"
                            >

                            </ion-input>
                        </ion-col>
                    </ion-row>
                    <ion-row
                        class="ion-align-items-center ion-padding-start"
                    >
                        <ion-col size="6">
                            <ion-input
                                class="ghost"
                                id="ghost-label"
                                for="ghost-value"
                                placeholder="Label"
                                autocomplete="off"
                                v-model="ghost.label"
                                @change="ghostInput"
                            >
                            </ion-input>
                        </ion-col>
                        <ion-col size="6">
                            <ion-input
                                type="number"
                                class="ion-text-end ion-padding-end ghost"
                                min="0"
                                v-model="ghost.value"
                                autocomplete="off"
                                placeholder="0.0"
                                @change="ghostInput"
                                @keyup="forbidden"
                            >
                            </ion-input>
                        </ion-col>

                    </ion-row>
                </div>
            </ion-col>
         </ion-row>
     </ion-grid>
    </div>
</template>

<script lang="ts">
import commonIonicComponents from '@/shared/common-ionic-components';
import { frontEndType } from '@/types/frontend.model';
import { computed, defineComponent, nextTick, onBeforeUpdate, onMounted, ref } from 'vue';
import { useData } from '../service/calculator.service';
import { create, closeCircle } from "ionicons/icons";
import { addIcons } from "ionicons";
import { Entry } from '@/types/entry.model'

addIcons({
    "ios-closeCircle" : closeCircle.ios,
    "md-closeCircle" : closeCircle.md,
    "ios-create" : create.ios,
    "md-create" : create.md
  });

interface DomRef {
    $el: any;
}
/* This is not a standard HTMLElement, but an Ionic Input, setFocus method would not be accessible. */

interface DomRefType {
     [index: string]: DomRef;
}

export default defineComponent({
    components: {
        ...commonIonicComponents
    },
    setup () {

        const {tsetForm, fetchFormData} = useData();
        const frontEnd = ref<frontEndType>();
        const ghost = ref<Entry>({
            label: '',
            value: null
        });

        onMounted(() => {
            fetchFormData();
            frontEnd.value = {
                hovered : -1,
                focusedValue : -1,
                showEditIcon : -1,
                editMode : -1,
            }
        });

        const domRefList = computed(() => 
            (tsetForm.value) ? ref(tsetForm.value.map((a, index) => index)) : ref([])
        );

        const total = computed((): number | null => 
            (tsetForm.value) ? tsetForm.value.map(a => a.value).reduce((a, b) => Number(a) + Number(b), 0) : null
        );

        const tsetFormatted = (value?: string | number | null): string => {
            if (!value) {
                return "0.0";
            }
            value = Number(value);

            const decimals = value % 1 ? value.toString().split(".")[1].length : 0;


            return (decimals > 1) ? value.toFixed(2) : value.toFixed(1);

        };

        const valueSet = computed(() =>  {
            return (tsetForm.value) ? tsetForm.value.map((a, index) => {
                if (frontEnd.value) {
                    return (frontEnd.value.focusedValue === index) ? a.value : tsetFormatted(a.value);
                }
            }): [];
        });


        const domRefs = ref({} as DomRefType);

        // Make sure to reset the refs before each update.
        onBeforeUpdate(() => {
            domRefs.value = {} as DomRefType;
        });


        const labelEdit = (target: number, event: any) => {
            if (tsetForm.value && frontEnd.value) {
                if (event.target.value) {
                        tsetForm.value[target].label = event.target.value;
                }
                frontEnd.value.editMode = -1;
            }
        };

        const switchToEdit = async (target: number) => {
            if (frontEnd.value && domRefs.value) {
                frontEnd.value.editMode = target;
                await nextTick();
                domRefs.value[target.toString() + '-label'].$el.setFocus();
            }
        };

        const dataBack = (target: number, event: any): void => {
            if (tsetForm.value && !isNaN(event.target.value)) {
                tsetForm.value[target].value = Number(event.target.value);
            }
        };

        const forbidden = (event: any): void => {
            if (event.key === "-") {
                event.target.value = event.target.value.slice(0, -1);
            }
        }; 

        const ghostError = (target: string): void => {
            const domElement = document.querySelector(target);
            if (domElement) {
                domElement.classList.add('error-sign');
                setTimeout(() => {
                    domElement.classList.remove('error-sign');
                }, 1000);
            }
        };

        const ghostInput = (): void => {
                ghost.value.label = ghost.value.label.trim();
                const labelCheck = ( ghost.value.label.match(/[^0-9]/) && ghost.value.label.length > 1 ) ? true : false;
                let decimalCheck = false;
                if (!labelCheck) {
                    ghostError('#ghost-label');
                }

                if (ghost.value.value) {
                    if (ghost.value.value.toString().length > 1) {
                        if (/^-?\d+(?:[.,]\d*?)$/.test(ghost.value.value.toString())) decimalCheck = true;
                    }
                }

                if (!decimalCheck) {
                    ghostError('#ghost-value');
                }
            
                if (!labelCheck || !decimalCheck) {
                    return;
                }

                    const newElement = ref<Entry>({
                        ...ghost.value
                    });

                if (tsetForm.value) {
                    tsetForm.value.push(newElement.value);
                }

                    ghost.value.label = '';
                    ghost.value.value = null;
        };

        const deletion = (target: number): void => {
            if (tsetForm.value) {
                tsetForm.value.splice(target, 1);
            }
        };

        return {
            tsetForm,
            frontEnd,
            labelEdit,
            switchToEdit,
            domRefList,
            domRefs,
            dataBack,
            valueSet,
            tsetFormatted,
            forbidden,
            closeCircle,
            create,
            total,
            ghost,
            ghostInput,
            deletion
        }
    }
})
</script>

<style scoped>

::v-deep input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none!important;
    -moz-appearance: none!important;
    appearance: none!important;
    margin: 0!important;
}

.input-style {
  -moz-appearance: textfield!important;
  border : 1px solid black!important;
}


.main {
    background-color : white;
    border : 5px solid black;
    border-radius: 10px;
    padding-bottom: 30px;
    margin-top: 30px;
}

.main-title {
    position: absolute;
    top: 24px;
    left: 30px;
    background-color: white;
    padding: 0 5px 0 5px;
}
.main-title h2 {
    padding : 0;
    margin : 0;
}

.unbordered {
    width : 100%;
    height: 37.9972px;
    display : flex;
    flex-direction: row;
    align-content: center;
    justify-content: flex-start;
    padding : 6px 8px 6px 12px;
    margin-top: 7px;
    padding-top: 8px;
}

.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    white-space: nowrap;
}

.clickable {
    cursor : pointer!important;
    z-index: 100;
}

.tset-icon {
    position : absolute;
    background : transparent;
    width: 25px;
    height: 25px;
}

.icon-inner {
    height: 100%; 
    width: 100%;
}

.edit {
    top: 17px;
    right : 13px;
    color : green; 
}

.erase {
    left : 9px;
    color : red; 
}

.isSelected {
    background-color : #fffbbd;
}

.ghost {
    color : #a1a1a1!important;
    border : 1px solid #a1a1a1!important;
}
::placeholder {
    color : #a1a1a1!important;
}

.error-sign {
    border : 1px solid red!important;
}

</style>