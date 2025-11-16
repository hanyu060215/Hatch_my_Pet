Place your background audio file here as `background.mp3`.

Options:

1) Quick (recommended):
   - Add an MP3 file at `public/background.mp3`.
   - The app will reference it at `/background.mp3` and play it when the user starts a round.

2) Bundle with the app (optional):
   - Add a file at `src/assets/background.mp3`.
   - Uncomment or add an import in `src/App.jsx`:
     ```js
     // import bg from './assets/background.mp3'
     // <audio ref={audioRef} src={bg} preload="auto" />
     ```
   - Bundling via `src/assets` will include the asset in the Vite build output.

Notes:
- Use a short loop-friendly royalty-free music track (MP3 or OGG).
- If you need a sample CC0 track, consider downloading from Free Music Archive or Pixabay Music.
- Browser autoplay policies require a user gesture to start playback; click the Start button to trigger audio playback.

Bundled fallback:

- If no `public/background.mp3` or bundled asset is present, the app now includes a small programmatic ambient tone (generated via the WebAudio API) as a built-in sample so you can hear background audio immediately without adding a file.
- To use your own track instead, add `public/background.mp3` or bundle via `src/assets` (see above).
