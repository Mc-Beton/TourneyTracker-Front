# API Endpoints Review

## Current Frontend API Implementation

### 1. Authentication API (Port 8081)

**Base URL:** `http://localhost:8081/api/users/auth`

#### Endpoints:

- **POST /login**

  - Body: `{ email: string, password: string }`
  - Response: JWT token (plain text)
  - File: `src/lib/api/auth.ts`

- **POST /register**
  - Body: `{ name: string, email: string, password: string }`
  - Response: Success message (plain text)
  - File: `src/lib/api/auth.ts`

### 2. Tournaments API (Port 8080)

**Base URL:** `http://localhost:8080` (configured via `NEXT_PUBLIC_API_URL`)

#### Endpoints:

- **GET /api/tournaments**

  - Response: `TournamentListItemDTO[]`
  - File: `src/lib/api/tournaments.ts`

- **GET /api/tournaments/:id**

  - Response: `TournamentDetailsDTO`
  - File: `src/lib/api/tournaments.ts`

- **POST /api/tournaments** ✅ FIXED
  - Body: `CreateTournamentDTO`
  - Response: `TournamentDetails`
  - File: `src/lib/api/tournaments.ts`
  - Note: Was pointing to just `API_BASE`, now correctly points to `${API_BASE}/api/tournaments`

## Issues Found & Fixed

### ✅ Fixed:

1. **Tournament Creation Endpoint** - Was using `API_BASE` instead of `${API_BASE}/api/tournaments`

### To Verify:

1. **Backend Response Format** - Ensure backend returns data in expected format
2. **Error Handling** - Backend errors should be properly formatted
3. **CORS** - Ensure backend has CORS enabled for localhost:3000

## Testing

Visit **http://localhost:3000/api-test** to test all endpoints interactively.

## Type Definitions

All type definitions are in:

- `src/lib/types/auth.ts` - Authentication types
- `src/lib/types/tournament.ts` - Tournament types

### Tournament Types:

```typescript
TournamentListItemDTO {
  id: number
  name: string
  startDate: string
  numberOfRounds: number
  roundDurationMinutes: number
  gameSystemId: number
  organizerId: number
}

TournamentDetailsDTO extends TournamentListItemDTO {
  participantIds: number[]
}

CreateTournamentDTO {
  name: string
  description?: string
  startDate: string
  endDate?: string
  numberOfRounds: number
  roundDurationMinutes: number
  gameSystemId: number
  type?: "SWISS"
  maxParticipants?: number
  registrationDeadline?: string
  location?: string
  venue?: string
  scoringSystem?: "ROUND_BY_ROUND" | "END_OF_MATCH"
  enabledScoreTypes?: string[]
  requireAllScoreTypes: boolean
  minScore?: number
  maxScore?: number
}
```

### Auth Types:

```typescript
LoginDTO {
  email: string
  password: string
}

RegisterDTO {
  name: string
  email: string
  password: string
}
```

## Environment Variables

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Note: Auth API is hardcoded to `http://localhost:8081/api/users/auth` in `src/lib/api/auth.ts`
