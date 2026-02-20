
# Refactoring Plan: Maintainability and Performance Improvements

## Summary

After a thorough review, I identified **6 key areas** for refactoring. The codebase has grown organically and accumulated duplicated patterns, oversized page components, and unused code that should be cleaned up.

---

## 1. Extract `CreateCriativoDialog` from `Criativos.tsx` (904 lines)

`Criativos.tsx` is the largest file at 904 lines. It contains an inline `CreateCriativoDialog` component (lines 46-250) that should be its own file, matching the pattern already used for `CreateCampaignGroupDialog`.

**What changes:**
- Move `CreateCriativoDialog` to `src/components/CreateCriativoDialog.tsx`
- Move the `IAB_FORMATS` constant to a shared constants file or into the new component
- Reduces `Criativos.tsx` by ~250 lines

---

## 2. Extract `CreateInsertionOrderDialog` from `InsertionOrders.tsx`

Same pattern -- `InsertionOrders.tsx` (497 lines) has an inline `CreateInsertionOrderDialog` (lines 23-142) that should be extracted.

**What changes:**
- Move to `src/components/CreateInsertionOrderDialog.tsx`
- Reduces `InsertionOrders.tsx` by ~120 lines

---

## 3. Remove duplicated `classifyEventByTagType` function

This exact function is copy-pasted in **3 files**:
- `src/hooks/useCampaigns.tsx` (lines 60-82)
- `src/hooks/useReportEvents.tsx` (lines 36-58)
- `src/pages/CriativoDetails.tsx` (lines 30-52)

It is only actually used in `CriativoDetails.tsx`. The copies in `useCampaigns.tsx` and `useReportEvents.tsx` are dead code.

**What changes:**
- Keep the function only in `CriativoDetails.tsx` (or move to a shared util)
- Remove the unused copies from the other two files

---

## 4. Remove unused hooks: `useDataCache`, `useOptimizedData`, `useVirtualScroll`, `useInfiniteScroll`

These hooks were created as performance utilities but are **never imported anywhere** in the codebase. The project uses TanStack Query for caching and standard pagination instead:

- `useDataCache.tsx` -- custom cache, fully replaced by TanStack Query
- `useOptimizedData.tsx` -- custom memoization wrappers, never used
- `useVirtualScroll.tsx` -- never used (pagination is used instead)
- `useInfiniteScroll.tsx` -- never used (pagination is used instead)

**What changes:**
- Delete all 4 files

---

## 5. Migrate `useProfiles` to TanStack Query

`useProfiles.tsx` is the only data-fetching hook still using raw `useState`/`useEffect` instead of TanStack Query. This means it:
- Re-fetches on every mount with no caching
- Has no stale/gc time management
- Doesn't match the pattern of the rest of the app

**What changes:**
- Create `src/hooks/queries/useProfilesQuery.tsx` using `useQuery`
- Simplify `useProfiles.tsx` to wrap the query (same pattern as `useCampaigns` / `useCampaignGroups`)

---

## 6. Extract duplicated pagination UI into a shared component

The exact same pagination pattern (Previous/Next buttons + page numbers with ellipsis) is duplicated across 3 pages:
- `Criativos.tsx`
- `Campanhas.tsx`
- `InsertionOrders.tsx`

**What changes:**
- Create `src/components/PaginatedList.tsx` (or just a `PaginationControls` component)
- Replace the ~40 lines of duplicated pagination JSX in each page with the shared component

---

## Technical Details

### Files to create:
- `src/components/CreateCriativoDialog.tsx`
- `src/components/CreateInsertionOrderDialog.tsx`
- `src/components/PaginationControls.tsx`
- `src/hooks/queries/useProfilesQuery.tsx`

### Files to modify:
- `src/pages/Criativos.tsx` -- remove dialog, use shared pagination
- `src/pages/InsertionOrders.tsx` -- remove dialog, use shared pagination
- `src/pages/Campanhas.tsx` -- use shared pagination
- `src/hooks/useCampaigns.tsx` -- remove dead `classifyEventByTagType`
- `src/hooks/useReportEvents.tsx` -- remove dead `classifyEventByTagType`
- `src/hooks/useProfiles.tsx` -- wrap TanStack Query

### Files to delete:
- `src/hooks/useDataCache.tsx`
- `src/hooks/useOptimizedData.tsx`
- `src/hooks/useVirtualScroll.tsx`
- `src/hooks/useInfiniteScroll.tsx`

### Impact:
- ~500 lines removed across dead code and deduplication
- Consistent data-fetching pattern (all hooks use TanStack Query)
- Smaller, more focused page components
- No behavioral or UI changes -- purely structural refactoring
