# Reeve CI / CD - Web UI Plugin

This is a [Reeve](https://github.com/reeveci/reeve) plugin that provides an admin web interface.

## Configuration

### Settings

Settings can be provided to the plugin through environment variables set to the reeve server.

Settings for this plugin should be prefixed by `REEVE_PLUGIN_WEBUI_`.

Settings may also be shared between plugins by prefixing them with `REEVE_SHARED_` instead.

- `ENABLED` - `true` enables this plugin
- `HTTP_PORT` - HTTP port on which the webserver should listen
- `HTTPS_PORT` - HTTPS port on which the webserver should listen
- `TLS_CERT_FILE` - TLS certificate file for HTTPS
- `TLS_KEY_FILE` - TLS key file for HTTPS
- `ADMIN_USERNAME` - Administrator username
- `ADMIN_PASSWORD` - Administrator password
- `CORS_ORIGIN` - Optional value for the Access-Control-Allow-Origin header for API requests
- `HISTORY_LIMIT` - Maximum number of pipelines to be preserved in memory (default `50`)

### 3rd Party Authentication

If you want authentication to be handled by a 3rd party, you can do so by configuring your Reverse Proxy to provide basic auth to the application.
By doing so, the server will set the corresponding session cookie when delivering the page.
Please note that the Authorization header sent by the web client must always be forwarded to the `/api/*` endpoints.

Here is a basic example using [Traefik](https://traefik.io/traefik) with [Authelia](https://authelia.com):

```yaml
http:
  routers:
    reeve-api:
      entryPoints:
        - websecure
      middlewares:
        - authelia@file
      rule: (Host(`ci.example.com`) && PathPrefix(`/api/`))
      service: reeve@file

    reeve:
      entryPoints:
        - websecure
      middlewares:
        - authelia@file
        - reeve-webui-auth@file
      rule: Host(`ci.example.com`)
      service: reeve@file

  services:
    reeve:
      loadBalancer:
        servers:
          - url: http://localhost:9081

http:
  middlewares:
    authelia:
      forwardAuth:
        address: http://authelia:9091/api/authz/forward-auth
        authResponseHeaders:
          - Remote-User
          - Remote-Groups
          - Remote-Name
          - Remote-Email
    reeve-webui-auth:
      headers:
        customRequestHeaders:
          Authorization: Basic dXNlcjpwYXNzd29yZA== # example basic auth header (user:password) - DO NOT USE!!
```
