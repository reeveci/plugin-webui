import { useMemo } from 'react';
import AuthContext from '@/AuthContext';
import Login from '@/Login';
import { TOKEN_COOKIE } from '@/environment';
import { getCookie, parseJWT, validateJWT } from '@/token';

function Auth({ children }) {
  const accessToken = getCookie(TOKEN_COOKIE);
  const accessTokenPayload = parseJWT(accessToken);
  const accessTokenValid = validateJWT(accessTokenPayload);

  const context = useMemo(
    () => ({ accessToken, accessTokenPayload }),
    [accessToken, accessTokenPayload],
  );

  if (!accessToken || !accessTokenValid) {
    return <Login />;
  }

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
}

export default Auth;
