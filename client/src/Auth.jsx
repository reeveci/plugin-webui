import React from "react";
import Login from "./Login";
import { TOKEN_COOKIE } from "./environment";
import { getCookie, validateJWT } from "./token";

export const AuthContext = React.createContext({});

function Auth({ children }) {
  const accessToken = getCookie(TOKEN_COOKIE);
  const accessTokenValid = validateJWT(accessToken);

  const context = React.useMemo(() => ({ accessToken }), [accessToken]);

  if (!accessToken || !accessTokenValid) {
    return <Login />;
  }

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
}

export default Auth;
