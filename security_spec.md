# Security Specification — IHR OSINT Academy (Firestore Zero-Trust Rules)

## 1. Data Invariants

1. **Default-Deny Catch-All**: No document outside explicitly matched paths is readable or writable.
2. **Email Verification Gate**: All standard authenticated mutations require `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Split-Collection Isolation**: Email PII is stored strictly inside `/users/{userId}/private/info` and never inside `/users/{userId}`. Read access to `/users/{userId}` and `/users/{userId}/private/{docId}` is restricted to `isOwner(userId) || isAdmin()`.
4. **Master Gate Relational Sync**: Every subcollection under `/users/{userId}/...` (`topicProgress`, `labProgress`, `notes`, `spacedRepetition`) requires that the parent `/users/{userId}` document exists and its `uid == userId` via `get()` on single-doc operations, and enforces `resource.data.uid == request.auth.uid` on `list` queries (zero `get()` inside `list`).
5. **Stage B Progression Gate**: A `TopicProgress` document with `stage == 'B'` can ONLY be created or updated if the parent `/users/{userId}` document has `stageACertified == true` (or `isAdmin()`), enforcing the Stage A -> Stage B lock at the database security layer.
6. **Certification Score Gate**: Setting `stageACertified == true` requires `stageAScore >= 70 && stageAScore <= 100`. Setting `stageBCertified == true` requires `stageACertified == true && stageBScore >= 70 && stageBScore <= 100`. Once `stageACertified` or `stageBCertified` is `true`, a non-admin cannot revert it to `false`.
7. **Privilege Escalation Prevention**: Users can never write to `/admins/{adminUid}` unless already `isAdmin()`, and `UserProfile` contains zero self-assigned role fields. Bootstrapped admin requires both `request.auth.token.email == 'fairytailsmuslim@gmail.com'` AND `request.auth.token.email_verified == true`.
8. **Temporal & Identity Immutability**: `createdAt` and `uid` / `authorUid` are strictly immutable on `update`; `createdAt == request.time` on `create` and `updatedAt == request.time` on both `create` and `update`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Shadow Field Injection on `UserProfile`**:
   `{ uid: "user_1", displayName: "Ada", ..., isAdmin: true }` -> Rejected by `data.keys().hasOnly(...)`.
2. **Payload 2 — Unverified Admin Email Spoof**:
   Token `{ email: "fairytailsmuslim@gmail.com", email_verified: false }` writing `/customTools/tool_1` -> Rejected by `request.auth.token.email_verified == true`.
3. **Payload 3 — Cross-User PII Scraping**:
   Authenticated `user_2` calling `get(/users/user_1/private/info)` -> Rejected by `isOwner(userId) || isAdmin()`.
4. **Payload 4 — Stage B Bypass Without Stage A Certificate**:
   Authenticated `user_1` (where `stageACertified == false`) writing `/users/user_1/topicProgress/cti-fundamentals` with `{ stage: "B", completed: true, ... }` -> Rejected by parent `get()` Stage A check.
5. **Payload 5 — Certificate Forgery With Failing Score (< 70%)**:
   Authenticated `user_1` updating `/users/user_1` with `{ stageACertified: true, stageAScore: 30 }` -> Rejected by `isValidUserProfile` score invariant (`!data.stageACertified || data.stageAScore >= 70`).
6. **Payload 6 — ID Poisoning (2KB Path Segment)**:
   Creating `/users/user_1/notes/<2000-char-junk>` -> Rejected by `isValidId(noteId)` (`size() <= 128 && matches('^[a-zA-Z0-9_\\-]+$')`).
7. **Payload 7 — Client Timestamp Forgery**:
   Creating `/users/user_1/notes/note_1` with `createdAt: Timestamp(2020, 1, 1)` -> Rejected by `incoming().createdAt == request.time`.
8. **Payload 8 — Immutable `createdAt` / `uid` Mutation on Update**:
   Updating `/users/user_1/notes/note_1` changing `uid` to `"user_2"` or `createdAt` -> Rejected by `affectedKeys().hasOnly(...)` and immutability gate.
9. **Payload 9 — Orphan Subcollection Write**:
   Authenticated `user_99` (no `/users/user_99` doc) writing `/users/user_99/notes/note_1` -> Rejected by Master Gate `exists(/databases/$(database)/documents/users/$(userId))`.
10. **Payload 10 — Value Poisoning on Allowed Update Key**:
    Updating `/users/user_1/notes/note_1` setting `content` to a 50,000-character string or boolean -> Rejected by `isValidStudyNote(incoming())` wrapping the entire `allow update` block.
11. **Payload 11 — Unauthorized Query Scraping (`list` without owner filter)**:
    Authenticated `user_2` listing `/users/user_1/notes` -> Rejected by `isOwner(userId) && resource.data.uid == request.auth.uid`.
12. **Payload 12 — Self-Assigned Admin Document Creation**:
    Authenticated non-admin `user_1` writing `/admins/user_1` -> Rejected by `allow write: if isAdmin()`.
