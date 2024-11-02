export function getCookie(name) {
  const key = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);

  return (
    decodedCookie
      .split(";")
      .find((entry) => entry.trim().startsWith(key))
      ?.trim()
      .substring(key.length) ?? ""
  );
}

export function setCookie(name, value, expires) {
  document.cookie = `${name}=${value};${
    expires ? `expires=${expires};` : ""
  }path=/`;
}

export function clearCookie(name) {
  setCookie(name, "", new Date(0));
}

export function parseJWT(token) {
  if (typeof token !== "string") return undefined;
  const b64URL = token.split(".")[1];
  if (!b64URL) return undefined;
  const b64 = b64URL.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(b64)
      .split("")
      .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

export function validateJWT(tokenPayload) {
  const { exp } = tokenPayload || {};
  if (exp > 0) return exp > Date.now() / 1000;
  return false;
}
