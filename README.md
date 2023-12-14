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
