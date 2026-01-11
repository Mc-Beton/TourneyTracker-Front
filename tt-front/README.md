# Tournament Management System

Frontend aplikacji do zarządzania turniejami, zbudowana z **Next.js 14**, **React 18**, **TypeScript**, **Tailwind CSS** i **shadcn/ui**.

## Technologie

- **Next.js 14** - Framework React z App Router
- **React 18** - Biblioteka UI
- **TypeScript 5.3** - Statyczne typowanie
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Komponenty UI (Button, Card, Input, Table, Textarea)

## Wymagania

- Node.js 18+
- npm lub yarn

## Instalacja i uruchomienie

```bash
# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev

# Zbuduj dla produkcji
npm run build

# Uruchom wersję produkcyjną
npm start
```

Aplikacja uruchomi się domyślnie na `http://localhost:3000`

## Konfiguracja

Utwórz plik `.env.local` w głównym katalogu projektu:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Struktura projektu

```
src/
├── app/                       # Next.js App Router
│   ├── layout.tsx            # Główny layout z AuthProvider
│   ├── page.tsx              # Strona główna (redirect)
│   ├── login/                # Strona logowania
│   ├── register/             # Strona rejestracji
│   ├── profile/              # Profil użytkownika
│   ├── api-test/             # Tester API endpoints
│   └── tournaments/
│       ├── page.tsx          # Lista turniejów
│       ├── new/              # Tworzenie turnieju
│       ├── my/               # Moje turnieje
│       └── [id]/
│           ├── page.tsx      # Szczegóły turnieju
│           └── edit/         # Edycja turnieju
├── components/
│   ├── MainLayout.tsx        # Layout z nawigacją i przyciskiem wstecz
│   └── ui/                   # Komponenty shadcn/ui
├── lib/
│   ├── api/                  # Warstwa API (http, auth, tournaments)
│   ├── auth/                 # System uwierzytelniania
│   └── types/                # Definicje typów TypeScript
└── globals.css               # Globalne style Tailwind
```

## Funkcjonalności

### Autentykacja

- ✅ Rejestracja użytkownika
- ✅ Logowanie z JWT
- ✅ Persistencja sesji (localStorage)
- ✅ Automatyczne przekierowania
- ✅ Wylogowanie

### Turnieje

- ✅ Lista wszystkich turniejów
- ✅ Szczegóły turnieju
- ✅ Tworzenie nowego turnieju (wymaga logowania)
- ✅ Edycja turnieju (tylko właściciel)
- ✅ Usuwanie turnieju (tylko właściciel)
- ✅ Lista moich turniejów

### UI/UX

- ✅ Responsywny design
- ✅ Przycisk "Wróć" na wszystkich podstronach
- ✅ Walidacja formularzy
- ✅ Obsługa błędów
- ✅ Loading states

## Backend

Aplikacja komunikuje się z backendem Spring Boot:

- **Port 8080**: Turnieje (`/api/tournaments`)
- **Port 8081**: Autentykacja (`/auth/*`)

Zobacz `API_ENDPOINTS.md` dla pełnej dokumentacji API.

## Licencja

MIT

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },

},
])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
