# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains application code.
- `src/api/` holds API clients and request helpers.
- `src/components/` holds reusable UI components.
- `src/pages/` contains route-level pages/screens.
- `src/styles/` contains shared styling helpers.
- `public/` contains static assets and the HTML template.
- Entry points are `src/index.js` and `src/App.js`.

## Build, Test, and Development Commands
- `npm start` starts the local dev server via `react-app-rewired` (hot reload at `http://localhost:3000`).
- `npm run build` creates a production build in `build/`.
- `npm test` runs Jest in watch mode.
- `npm run eject` is available but should be avoided unless you intend to own the full CRA config.

## Coding Style & Naming Conventions
- JavaScript/React project (Create React App + `react-app-rewired`).
- Indentation: 2 spaces, LF line endings.
- Component files use PascalCase (e.g., `UserCard.js`).
- Hooks and utility functions use camelCase (e.g., `useAuth`, `formatPrice`).
- CSS/Tailwind: Tailwind is configured via `tailwind.config.js` and `postcss.config.js`.
- Linting is provided by CRA ESLint presets (`react-app`, `react-app/jest`).

## Testing Guidelines
- Test runner: Jest with React Testing Library.
- Place tests alongside code or in `src/` with `*.test.js` naming (e.g., `App.test.js`).
- Focus on user-visible behavior; prefer `@testing-library/user-event` over shallow rendering.

## Commit & Pull Request Guidelines
- Commit style follows Conventional Commits observed in history. Examples: `feat(member): add signup page`, `fix(app): handle 401 logout`. Use `feat`, `fix`, or `chore` as needed and include a scope when relevant.
- Pull requests should include a short summary of changes and rationale, a linked issue or ticket (if available), screenshots or GIFs for UI changes, and notes on testing performed (e.g., `npm test`).

## Configuration Notes
- Payment integration uses `@tosspayments/payment-widget-sdk`.
- Environment-specific values should be provided via `.env` files (not committed).
