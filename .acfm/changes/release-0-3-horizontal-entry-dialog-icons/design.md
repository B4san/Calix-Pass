## Decisions

1. `Dialog` soporta `size=xl`, `max-h` y scroll interno.
2. `EntryForm` usa header compacto + grid responsive (`md:grid-cols-2`).
3. Se copia `fav/Icon.png` a `build/icon.png` y `public/icon.png` para
   empaquetado + runtime renderer.
4. Se valida con `test:smoke`, `typecheck`, `build`.
