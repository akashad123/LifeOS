# LifeOS - Coding Rules

## React & Development Conventions
- Build one stable module at a time. Do not implement everything simultaneously.
- No direct Supabase calls inside presentation components. Use the `services/` -> `hooks/` -> `components/` pattern.
- Keep dependencies minimal. Do not introduce Redux or React Query unless specifically mandated.
- Do not modify unrelated functionality when working on a specific feature.

## Naming Conventions
- **Components & Pages:** PascalCase (e.g., `DailyRoutines.jsx`, `Button.jsx`).
- **Hooks:** camelCase, prefixed with `use` (e.g., `useRoutines.js`).
- **Services & Utils:** camelCase (e.g., `supabaseClient.js`, `dateUtils.js`).
- **Tailwind Classes:** standard kebab-case.
- **Database Tables/Columns:** snake_case (e.g., `daily_routines`, `user_id`).

## Reusable Component Rules
- Reusable generic UI components live in `src/components/ui/`.
- Name them generically (e.g., `Button.jsx`, `Card.jsx`, `Input.jsx`). Do NOT use prefixes like `SharpButton` or `SharpCard`.
- Components must be flexible, accepting props to handle different states (loading, disabled, empty, error).
- Standardized components include: `Button`, `Card`, `Input`, `Textarea`, `Select`, `Modal`, `ConfirmDialog`, `EmptyState`, `LoadingState`, `ErrorState`, `FileUpload`.

## Global Styling & Sharp-Edge Rule
- **Framework:** Tailwind CSS.
- **Sharp Edges Only:** LifeOS uses a strict modern boxy/sharp-edged UI. Use `rounded-none` globally.
- **Prohibited Classes:** `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`.
- **Exceptions:** `rounded-full` is allowed ONLY for genuinely circular elements like avatars or small status indicators.
- **Consistency:** Centralize common UI patterns into reusable components instead of repeatedly writing large Tailwind class strings on every page.

## Dynamic Data Rules
- **No Hardcoding:** Changing user data must NEVER be hardcoded into React components. All lists, routines, categories, and items must eventually come from Supabase.
- **Resilience:** The UI must continue to work perfectly without breaking layouts in all scenarios:
  - Zero records (show `EmptyState`)
  - One record
  - Many records (enable scrolling/pagination)
  - Long text (use truncation or wrapping)
  - Missing optional fields

## Formatting Rules
- **Monetary Display:** Indian Rupee (INR) is the default monetary display convention throughout LifeOS. Use `formatCurrencyINR` (native `Intl.NumberFormat` with `en-IN` / `INR`) for all monetary rendering unless a future feature explicitly requires another currency. Do not store formatted currency strings, commas, or the ₹ symbol in Supabase (store as numeric).

## Responsive Design Rules
- LifeOS must work perfectly across desktop, laptop, tablet, and mobile.
- Use responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), flex wrapping, and responsive spacing.
- Avoid unnecessary fixed dimensions (e.g., hardcoded `height: 300px` or `width: 500px`) that could break on smaller screens or when dynamic data is excessively long.
