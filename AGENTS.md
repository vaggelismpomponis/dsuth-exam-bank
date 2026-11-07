<!-- bmad:context -->
<!-- Verified 2026-08-31 against 1c3c4af. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## Spendlore

Single Source of Truth personal finance application powering Web (PWA) and Android Native. React 18, Vite, TailwindCSS, Capacitor, Supabase. Vercel for serverless APIs. Architecture and deployment details live in `ARCHITECTURE.md` and `DEPLOYMENT.md`.

## Where things are

- Serverless API endpoints: `api/`
- Android Capacitor project: `android/`

## Running and verifying

- Generate mobile assets: `npx @capacitor/assets generate --android`
- Open Android Studio: `npx cap open android`

## Conventions that differ from defaults

- Configure Tesseract.js for Greek and English: `eng+ell`
- Configure speech recognition for Greek: `el-GR`
- Provide `webkitSpeechRecognition` fallback when using `@capacitor-community/speech-recognition` in browser.

<!-- /bmad:context -->

## Git & Version Control Guidelines

- **Explicit Commit Policy (On User Request Only)**:
  - **NEVER** automatically commit changes, bump versions, or run mobile preparation during regular tasks, code modifications, bug fixes, or refactors.
  - **ONLY** perform mobile preparation, Android version bumping, staging, and local commits when the USER EXPLICITLY requests it (e.g. "commit changes", "κάνε commit τις αλλαγές").
- **Commit Policy (Do Not Push)**: All commits are strictly local (`git add`, `git commit`). NEVER push (`git push`); the user handles pushing to remote manually.
- **Commit Message Convention**: Follow the Conventional Commits standard with a professional, corporate, and easy-to-understand message format:
  - **Format**: `<type>(<scope>): <concise summary>`
  - **Types**:
    - `feat`: New user-facing feature or enhancement (e.g., `feat(notifications): add swipe-to-delete action for individual notifications`)
    - `fix`: Bug fix (e.g., `fix(budgets): resolve threshold alert calculation`)
    - `refactor`: Code restructuring without behavioral change
    - `style`: Visual design, layout polish, or UI CSS styling
    - `perf`: Performance optimizations
    - `chore`: Maintenance, dependencies, asset updates, or Capacitor sync
    - `docs`: Documentation, guides, or rule updates
  - **Tone & Style Rules**:
    - Use imperative, present tense ("add", "implement", "resolve", "update" — avoid "added", "fixing", "updated").
    - Keep commit titles clear, specific, and self-explanatory (avoid vague messages like "update files" or "fixes").
    - For non-trivial changes, include a concise body or bullet points detailing the business rationale and technical scope.
- **Mandatory Mobile Preparation & Version Bump (STRICTLY ON USER COMMIT REQUEST ONLY)**:
  - Execute these steps **ONLY when the user explicitly requests to commit changes** (never on regular code edits or tasks):
    1. **Execute mobile preparation script**:
       ```bash
       npm run prepare-mobile
       ```
       (which runs `npm run build && npx cap sync` to build the web bundle and sync native Android assets).
    2. **Increment Android version numbers** in `android/app/build.gradle`:
       - Increment `versionCode` by +1
       - Increment `versionName` patch version (e.g., `1.1.26` -> `1.1.27`)
    3. Stage all modified files, `android/app/build.gradle`, and synchronized mobile assets, and create the local commit.
- **No Remote Push**: Do NOT execute `git push` under any circumstances. All remote pushes are handled manually by the user.

## Iconography & UI Design Guidelines

- **Lucide Icons Standard**: All icons throughout the application UI must strictly use Lucide icons (`lucide-react`) to maintain a clean, professional, and corporate aesthetic.
- **Prohibit Emojis as UI Icons**: Never use raw emojis or Unicode symbols (e.g., ⚠️, 🔥, 🎯, ✈️, 🚗, 🏠) as icons, category indicators, badges, or button graphics. Emojis render inconsistently across operating systems and browsers, lack vector scalability, and detract from a premium corporate appearance.
- **Prohibit Sparkles & Lightning Icons**: Never use `Sparkles` (stars) or `Zap` (lightning bolts) anywhere in the application (including cards, headers, badges, tips, or buttons). They read as gimmicky AI tropes or gaming power-ups and detract from a serious, corporate personal finance aesthetic. Instead, always use clean, semantic, professional icons (e.g., `CheckCircle2`, `ShieldCheck`, `Target`, `RefreshCw`, `TrendingUp`, `Wallet`, `CreditCard`, `Lightbulb`).
- **Prohibit Fake Initial Avatar Boxes in Admin Panel**: Never generate artificial initial badge boxes (e.g. `[AS]`, `[GO]`, `[SO]`, `w-11 h-11 bg-gradient-...`) in admin panels, user management lists, or telemetry leaderboards. Authentic user profile pictures and photos (uploaded by users or from Google OAuth) are preserved and displayed normally in app headers, user profile cards, and settings. Keep administrative user listings clean and typography-driven.
- **Unified Sizing & Styling**: Render Lucide icons with consistent sizes (e.g., `size={13}` to `size={15}` for badges/chips with `shrink-0`, `size={16}` to `size={20}` for buttons/nav, `size={24}+` for hero/empty states) and style them with design system CSS tokens and theme-aware color utilities.

## Executive Modal & Form Design Standards

Whenever building or redesigning modals, dialogs, forms, or new interactive surfaces:
- **Card Surface & Border**: Use `bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl` with backdrop `bg-black/60 backdrop-blur-md`.
- **Header Typography & Controls**:
  - Title: `text-lg font-bold text-gray-900 dark:text-white`.
  - Subtitle: `text-xs text-gray-500 dark:text-gray-400 mt-0.5`.
  - Close button: `p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors` with `<X size={18} />`.
  - **No Boxed Icon Containers**: Do NOT place icons inside colored boxed containers (e.g., `w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20`) in modal headers or card headers. Keep headers clean and typography-focused.
  - **No Gimmick / Promotional Badges**: Avoid promotional badges (e.g., `ΣΥΝΙΣΤΑΤΑΙ` / `Recommended` chips) above modal titles.
- **Form Labels & Inputs**:
  - Labels: `block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest`.
  - Inputs: `w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all`.
  - Focus Ring: Always use monochrome focus `focus:ring-1 focus:ring-gray-950 dark:focus:ring-white`. Never use glowing purple or indigo focus rings.
- **Balanced Action Button Row**:
  - Container: `flex gap-3 pt-2`.
  - Secondary Action (Cancel / Later): `flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm`.
  - Primary Action (Save / Submit): `flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50` with `<Check size={16} />`. (For financial income/deposit actions, use semantic emerald `bg-emerald-600 hover:bg-emerald-700 text-white`).
  - Never use full-width electric purple/violet buttons (`bg-violet-600`) for standard modal forms.
