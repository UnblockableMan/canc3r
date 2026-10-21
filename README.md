# C3

C3 by canc3r is a lightweight, static media hub with a black, silver, and pink interface. It keeps the existing `assets/` directory and `image.png`; the rest of the previous application has been replaced.

## Run locally

Serve this directory over HTTP:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit <http://localhost:8000>. No frontend build or package installation is required.

## Services

- **Games:** loads the Seraph JSON index from jsDelivr. Game metadata and URLs are credited to [GMShelf / Seraph](https://github.com/gmshelf/seraph).
- **Manga:** connects to a self-hosted [x8rr/manga](https://github.com/x8rr/manga) API. Set the base URL under Settings.
- **Movies & TV:** connects to a self-hosted [x8rr/movies](https://github.com/x8rr/movies) API. Configure its TMDB key on the server, then set its base URL under Settings.
- **Music:** connects to a self-hosted [x8rr/music](https://github.com/x8rr/music) API. Its audio backend also needs yt-dlp and a configured YouTube Music base.
- **Cloud games:** [x8rr/stratus-api](https://github.com/x8rr/stratus-api) is a server-side session and signaling component, not a standalone public browser API. A trusted host adapter is needed before C3 can launch cloud sessions.
- **Extensions:** [x8rr/sapphire](https://github.com/x8rr/sapphire) is a Scramjet plugin. This rebuild removes Scramjet, so Sapphire cannot be installed until a compatible browsing runtime and host integration are added.

Service URLs are saved in this browser's local storage. Backends must be reachable from the browser and allow CORS requests from the C3 origin. Do not put private API keys in frontend settings.

## License and retained assets

The original repository license is retained in [LICENSE](./LICENSE). The pre-existing `assets/` directory and root `image.png` are kept intact; consult notices included with those resources for their individual terms.
