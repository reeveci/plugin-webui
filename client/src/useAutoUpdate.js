import { useEffect, useState } from 'react';

function useAutoUpdate(notify, interval) {
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    function onVisibilityChange() {
      setVisible(!document.hidden);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!visible) return;

    notify();

    const i = setInterval(notify, interval);

    return () => clearInterval(i);
  }, [notify, interval, visible]);
}

export default useAutoUpdate;
