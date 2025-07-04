import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

export default function useSearchParam(name) {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get(name);

  const [state, setState] = useState(param);

  useEffect(() => {
    setSearchParams(
      (searchParams) => {
        if (state) searchParams.set(name, state);
        else searchParams.delete(name);
        return searchParams;
      },
      { replace: true },
    );
  }, [name, state, setSearchParams]);

  return [state, setState];
}
