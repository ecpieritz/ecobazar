# Ecobazar

> A fully mocked grocery e-commerce storefront built with modern Angular, TypeScript, Signals, and SCSS.

Ecobazar is a frontend-only portfolio project that demonstrates a complete grocery shopping journey without an external backend. An Angular HTTP interceptor serves typed in-memory fixtures, while browser storage preserves the customer session, cart, and wishlist.

## Highlights

- Responsive home, catalog, product details, quick view, search, and filtering
- Signal-based cart and wishlist with stock rules, shipping, and mock coupons
- Mocked authentication, protected account area, profile settings, and order history
- Reactive checkout that creates an order and exposes its delivery progress
- About, FAQ, contact, and not-found experiences
- Accessible navigation, skip link, route focus management, semantic disclosures, dialogs, drawers, and live notifications
- Lazy-loaded routes, optimized local images, production bundle budgets, linting, formatting, and Vitest coverage

## Stack

- Angular 21 with standalone components and lazy routes
- TypeScript in strict mode
- Angular Signals and RxJS
- Reactive Forms
- SCSS with shared design tokens and responsive foundations
- Vitest, Angular Testing Utilities, ESLint, and Prettier

## Requirements

- Node.js `20.19+` or `22.12+`
- npm `10+`

## Getting started

```bash
npm install
npm start
```

Open `http://localhost:4200` in your browser. Development mode uses the local mock API automatically; no server, database, or environment secret is required.

## Demo account

```text
Email: demo@ecobazar.com
Password: Password123!
```

Authentication is simulated. The session token is generated locally and is only used by the mock interceptor.

## Mock shopping rules

- `FRESH10`: 10% discount on eligible carts
- `SAVE5`: fixed $5 discount on eligible carts
- Shipping is calculated from the cart subtotal
- Product stock, checkout failures, orders, and delivery statuses are all simulated
- Cart, wishlist, and remembered sessions persist in local storage

To exercise the contact form error state, submit an otherwise valid email ending in `@fail.test`.

## Commands

| Command                     | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `npm start`                 | Run the development server                            |
| `npm run build`             | Create an optimized production build                  |
| `npm test -- --watch=false` | Run the test suite once                               |
| `npm run lint`              | Check TypeScript and templates                        |
| `npm run format:check`      | Verify formatting                                     |
| `npm run check`             | Run lint, formatting, tests, and the production build |

## Architecture

```text
src/app/
|-- core/
|   |-- api/             # Typed endpoint contracts
|   |-- auth/            # Session store, guard, and token interceptor
|   |-- data-access/     # HTTP repositories
|   |-- mock-api/        # Fixtures, request handlers, and mock interceptor
|   |-- notifications/   # Global feedback and unexpected-error handling
|   |-- persistence/     # Typed local-storage adapter
|   `-- state/           # Cart and wishlist state
|-- features/            # Lazy storefront and account capabilities
|-- layout/              # Header, footer, breadcrumbs, drawers, and shell
`-- shared/              # Reusable UI components and utilities
```

Feature pages depend on repositories and application stores rather than importing fixtures directly. The HTTP boundary therefore remains replaceable by a real API while UI state stays strongly typed.

## Testing

The suite covers pricing, persistence, authentication, route guards, repositories, mocked HTTP handlers, catalog behavior, product interactions, checkout, account pages, institutional content, global feedback, and a critical integration journey from login through order history.

## Production notes

The default build configuration enables optimization, output hashing, route chunking, and bundle budgets. Images below the initial viewport use native lazy loading and explicit dimensions to reduce layout shifts.

This repository is an educational frontend demonstration. Payments, account changes, messages, and orders are not sent to real services.
