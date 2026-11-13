# Baby Mo Hijaiyah — working notes for Claude

Same rules as babymo-app/CLAUDE.md:
- Art: render 1 (`assets/mo/`, from `babymo-app/www/baby-mo-poses`) first. Render 2 (`assets/mo2/`) only upper body
  (`HJ.moImg("mo2:…")` crops it). No old Kata Baik poses.
- Never depict Allah, prophets or angels. Arabic and Qur'an text must stay exact: Qur'an text only via
  `tools/build-quran.js`; every Q(...) fragment is checked by `npm run check` (must pass).
- Every user-facing string in Indonesian and English (`js/store.js` W table, `T(id,en)` in curriculum); dark mode must work.
- Kids Category: no third-party data in the app build (`HJ_APP_BUILD`), parental gate on parent area / external links.
- Replaced assets get a new filename or `?v=` bump; run `npm run sw` and bump VERSION in tools/build-sw.js when shipping.
