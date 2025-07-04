import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';

export default function useDebouncedValue(value, wait) {
  const [state, setState] = useState(value);

  const updateState = useMemo(() => debounce(setState, wait), [wait]);

  useEffect(() => {
    updateState(value);
  }, [updateState, value]);

  useEffect(
    () => () => {
      updateState.cancel();
    },
    [updateState],
  );

  return state;
}
