import { ConfigProvider, DataProvider } from '@civet/core';
import debounce from 'lodash.debounce';
import { useState } from 'react';
import superagent from 'superagent';
import { TextDecoder as DecoderPolyfill } from 'text-encoding-utf-8';
import Url from 'url-parse';
import { API_URL, TOKEN_COOKIE } from '@/environment';
import { clearCookie, getCookie } from '@/token';

if (typeof window.TextDecoder === 'undefined') {
  window.TextDecoder = DecoderPolyfill;
}

function joinURL(base, path) {
  const url = new Url(base, {});
  url.set(
    'pathname',
    url.pathname.replace(
      /\/*$/,
      path?.startsWith('/') ? path : `/${path ?? ''}`,
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
      return this.stream(
        resource,
        typeof options.stream === 'boolean' ? {} : options.stream,
      );
    }

    try {
      const res = await superagent
        .get(joinURL(this.url, resource))
        .query(options.searchParams ?? {})
        .accept('json')
        .set('Authorization', `Bearer ${this.token}`);

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
        .accept('json')
        .set('Authorization', `Bearer ${this.token}`)
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

  async stream(resource, { debounce: wait, maxWait } = {}) {
    return async (origCb, abortSignal) => {
      let cb = origCb;

      try {
        let abortController;
        if (AbortController != null) {
          abortController = new AbortController();
          abortSignal.listen(() => abortController.abort());
        }

        const res = await fetch(joinURL(this.url, resource), {
          mode: 'cors',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: {
            Accept: 'text/plain',
            Authorization: `Bearer ${this.token}`,
          },
          signal: abortController == null ? undefined : abortController.signal,
        });

        if (!res.ok) {
          throw new Error(`Connection failed (status ${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');

        if (wait > 0) {
          cb = debounce(origCb, wait, { maxWait });
        }

        let data = '';
        let chunk = {};
        while (!abortSignal.aborted && !chunk.done) {
          chunk = await reader.read();

          data += decoder.decode(chunk.value ?? new Uint8Array(), {
            stream: !chunk.done,
          });
          if (data.startsWith('#:INIT:x')) {
            data = data.replace(/^(#:INIT:x+\n)+/g, '');
          }

          cb(undefined, false, [data]);
        }

        cb(undefined, true, [data]);
      } catch (err) {
        cb(err);
      } finally {
        cb.flush?.();
      }
    };
  }
}

function Civet({ children }) {
  const [dataProvider] = useState(() => new UIDataProvider());

  return (
    <ConfigProvider dataProvider={dataProvider}>{children}</ConfigProvider>
  );
}

export default Civet;
