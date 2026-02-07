# PWA (Progressive Web App) - Instrukcja

## ✅ Implementacja zakończona!

PWA zostało pomyślnie skonfigurowane w aplikacji TourneyTracker.

### Co zostało zrobione:

1. **Zainstalowano pakiet**: `@ducanh2912/next-pwa`
2. **Skonfigurowano next.config.js** z obsługą PWA
3. **Utworzono manifest.json** z metadanymi aplikacji
4. **Zaktualizowano layout.tsx** z meta tagami PWA
5. **Dodano ikony PWA**: 192x192 i 512x512
6. **Utworzono stronę offline** (`/offline`)
7. **Zaktualizowano .gitignore** aby ignorować wygenerowane pliki SW

### Funkcjonalności PWA:

✅ **Instalowalna** - użytkownicy mogą dodać aplikację do ekranu głównego  
✅ **Offline** - podstawowe cache'owanie zasobów  
✅ **Responsywna** - działa na wszystkich urządzeniach  
✅ **Szybka** - cache'owanie po stronie klienta  
✅ **Bezpieczna** - wymaga HTTPS w produkcji

### Testowanie PWA:

#### W trybie development (localhost):

PWA jest **wyłączone** - to normalne zachowanie dla szybszego developmentu.

#### W trybie production:

1. **Zbuilduj aplikację**:

   ```bash
   npm run build
   npm run start
   ```

2. **Otwórz w przeglądarce** (Chrome/Edge):
   - Otwórz DevTools (F12)
   - Zakładka "Application" → "Manifest"
   - Sprawdź czy manifest się ładuje
   - Zakładka "Service Workers" - powinien być aktywny SW

3. **Test instalacji**:
   - W Chrome/Edge pojawi się ikona "Install" w pasku adresu
   - Kliknij aby zainstalować aplikację
   - Aplikacja pojawi się jako osobna aplikacja w systemie

4. **Test offline**:
   - Zainstaluj aplikację
   - W DevTools: Application → Service Workers → Offline
   - Odśwież stronę - powinna działać z cache

### Produkcja:

⚠️ **Wymagania**:

- HTTPS (PWA nie działa przez HTTP, tylko localhost)
- Poprawne ikony (obecne to placeholder z logo.png)

### Rekomendacje do poprawy:

1. **Ikony PWA**: Zamień placeholder ikony na właściwe:
   - Użyj narzędzia jak [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
   - Lub stwórz własne w rozmiarach: 192x192, 512x512, 144x144, 72x72
   - Format: PNG z przezroczystym tłem lub jednolitym kolorem

2. **Screenshot**: Dodaj screenshot aplikacji do `public/screenshot-mobile.png` (540x720)

3. **Push Notifications** (opcjonalnie):
   - Wymaga dodatkowej konfiguracji VAPID keys
   - Backend musi wysyłać notyfikacje przez Web Push API

4. **Advanced Caching**:
   - Możesz dostosować strategie cache w `workboxOptions`
   - Przykład: cache API responses, images, fonts osobno

### Używanie w produkcji:

```bash
# Build
npm run build

# Start production server
npm run start
```

Lub deploy na:

- **Vercel** (automatycznie wspiera PWA)
- **Netlify**
- **Docker** z nginx + HTTPS

---

**Gotowe do testowania!** 🚀
