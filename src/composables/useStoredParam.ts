import { useLocalStorage, useUrlSearchParams, type UrlParams } from '@vueuse/core';
import {
  nextTick,
  ref,
  toRef,
  watch,
} from 'vue';

let params: UrlParams | undefined;

export default function useStoredParam(key: string) {
  params ??= useUrlSearchParams('hash');
  const value = ref('');
  const store = useLocalStorage(key, '');
  const param = toRef(params, key);
  const initialized = ref(false);

  watch(value, (newValue) => {
    param.value = newValue;
    if (initialized.value) store.value = newValue;
  });

  const init = async (validate: (value: string) => boolean, initialValue: string) => {
    if (typeof param.value === 'string' && validate(param.value)) {
      value.value = param.value;
    } else if (typeof store.value === 'string' && validate(store.value)) {
      value.value = store.value;
    } else {
      value.value = initialValue;
    }
    await nextTick(() => initialized.value = true);
  };

  return { value, init };
}
