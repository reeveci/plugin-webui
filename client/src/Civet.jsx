import { ConfigProvider, DataProvider } from "@civet/core";
import React from "react";
import superagent from "superagent";
import { TextDecoder as DecoderPolyfill } from "text-encoding-utf-8";
import Url from "url-parse";
import { API_URL, TOKEN_COOKIE } from "./environment";
import { clearCookie, getCookie } from "./token";

if (typeof window.TextDecoder === "undefined") {
  window.TextDecoder = DecoderPolyfill;
}

function joinURL(base, path) {
  const url = new Url(base, {});
  url.set(
    "pathname",
    url.pathname.replace(
      /\/*$/,
      path && path.startsWith("/") ? path : `/${path || ""}`,
    ),
  );
  return url.href;
}

class UIDataProvider extends DataProvider {
  constructor() {
    super();

    this.token = getCookie(TOKEN_COOKIE);
    this.url = API_URL;
  }

  async handleGet(resource, query, options) {
    if (options.stream) {
      return this.stream(resource);
    }

    try {
      const res = await superagent
        .get(joinURL(this.url, resource))
        .accept("json")
        .set("Authorization", `Bearer ${this.token}`);

      return options.getItems(res.body, query);
    } catch (err) {
      if (err.status === 401) {
        clearCookie(TOKEN_COOKIE);
        window.location.reload();
        throw err;
      } else if (err.status === 404) {
        return [];
      }
      throw err;
    }
  }

  async handleCreate(resource, data) {
    try {
      const res = await superagent
        .post(joinURL(this.url, resource))
        .accept("json")
        .set("Authorization", `Bearer ${this.token}`)
        .send(data);

      return res.body;
    } catch (err) {
      if (err.status === 401) {
        clearCookie(TOKEN_COOKIE);
        window.location.reload();
        throw err;
      }
      throw err;
    }
  }

  async stream(resource) {
    return async (cb, abortSignal) => {
      try {
        let abortController;
        if (AbortController != null) {
          abortController = new AbortController();
          abortSignal.listen(() => abortController.abort());
        }

        const res = await fetch(joinURL(this.url, resource), {
          mode: "cors",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "text/plain",
            Authorization: `Bearer ${this.token}`,
          },
          signal: abortController == null ? undefined : abortController.signal,
        });

        if (!res.ok) {
          throw new Error(`Connection failed (status ${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let data = "";
        let chunk = {};
        while (!abortSignal.aborted && !chunk.done) {
          chunk = await reader.read();

          data += decoder.decode(chunk.value || new Uint8Array(), {
            stream: !chunk.done,
          });
          if (data.startsWith("#:INIT:x")) {
            data = data.replace(/^(#:INIT:x+\n)+/g, "");
          }

          cb(undefined, false, [data]);
        }

        cb(undefined, true, [data]);
      } catch (err) {
        cb(err);
      }
    };
  }
}

function Civet({ children }) {
  const [dataProvider] = React.useState(() => new UIDataProvider());

  return (
    <ConfigProvider dataProvider={dataProvider}>{children}</ConfigProvider>
  );
}

export default Civet;

export function useAutoUpdate(notify, interval) {
  const [visible, setVisible] = React.useState(!document.hidden);

  React.useEffect(() => {
    function onVisibilityChange() {
      setVisible(!document.hidden);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  React.useEffect(() => {
    if (!visible) return;

    notify();

    const i = setInterval(notify, interval);

    return () => clearInterval(i);
  }, [notify, interval, visible]);
}
