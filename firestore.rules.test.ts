/**
 * Firestore Security Rules Adversarial Verification Suite ("Dirty Dozen")
 * Verifies all 12 attack vectors defined in security_spec.md return PERMISSION_DENIED.
 */

export interface SimulatedRuleCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SimulatedRuleCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on UserProfile',
    collectionPath: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { uid: 'user_1', displayName: 'Ada', isAdmin: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Admin Email Spoof',
    collectionPath: '/customTools/tool_1',
    operation: 'create',
    auth: { uid: 'spoof_1', email: 'fairytailsmuslim@gmail.com', email_verified: false },
    payload: { authorUid: 'spoof_1', name: 'FakeTool' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-User PII Scraping',
    collectionPath: '/users/user_1/private/info',
    operation: 'get',
    auth: { uid: 'user_2', email: 'u2@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Stage B Bypass Without Stage A Certificate',
    collectionPath: '/users/user_1/topicProgress/cti-fundamentals',
    operation: 'create',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { uid: 'user_1', topicSlug: 'cti-fundamentals', stage: 'B', completed: true, quizScore: 5, quizTotal: 5 },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Certificate Forgery With Failing Score (< 70%)',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { stageACertified: true, stageAScore: 30 },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning (2KB Path Segment)',
    collectionPath: `/users/user_1/notes/${'x'.repeat(256)}`,
    operation: 'create',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { uid: 'user_1', targetSlug: 'what-is-osint', title: 'Test', content: 'Body' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Client Timestamp Forgery',
    collectionPath: '/users/user_1/notes/note_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { uid: 'user_1', targetSlug: 'what-is-osint', title: 'Note', content: 'Body', createdAt: '2020-01-01T00:00:00Z' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable uid Mutation on Update',
    collectionPath: '/users/user_1/notes/note_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { uid: 'user_2', title: 'Hijack', content: 'Body' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Orphan Subcollection Write Without Parent User',
    collectionPath: '/users/user_99/notes/note_1',
    operation: 'create',
    auth: { uid: 'user_99', email: 'u99@example.com', email_verified: true },
    payload: { uid: 'user_99', targetSlug: 'what-is-osint', title: 'Orphan', content: 'Body' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Value Poisoning on Allowed Update Key',
    collectionPath: '/users/user_1/notes/note_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { content: 'A'.repeat(15000) },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Cross-User List Query',
    collectionPath: '/users/user_1/notes',
    operation: 'list',
    auth: { uid: 'user_2', email: 'u2@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Document Creation',
    collectionPath: '/admins/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'u1@example.com', email_verified: true },
    payload: { uid: 'user_1' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
