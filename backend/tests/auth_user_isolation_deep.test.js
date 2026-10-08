import 'dotenv/config';
import assert from 'assert';
import mongoose from 'mongoose';
import connectDB from '../config/db.config.js';
import { User } from '../models/user.model.js';
import { Note } from '../models/note.model.js';
import { Notification } from '../models/notification.model.js';
import { FocusSession } from '../models/focusSession.model.js';
import noteController from '../services/note-service/note.controller.js';
import notificationController from '../services/notification-service/notification.controller.js';
import analyticsController from '../services/analytics-service/analytics.controller.js';
import { FocusController } from '../services/focus-service/focus.controller.js';

function createMockReqRes({ cookies = {}, headers = {}, body = {}, user = null, params = {}, query = {}, branchId = null } = {}) {
  const req = {
    cookies: { ...cookies },
    header: (name) => headers[name.toLowerCase()] || headers[name] || null,
    headers: { ...headers },
    body: { ...body },
    params: { ...params },
    query: { ...query },
    branchId: branchId || '6a081b6e111c99b633b00d76',
    user,
    ip: '127.0.0.1'
  };

  const res = {
    statusCode: 200,
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    }
  };

  return { req, res };
}

async function runDeepUserIsolationTests() {
  await connectDB();
  console.log('=== TEST SUITE: DEEP BACKEND USER ISOLATION (USER A vs B vs C) ===\n');

  // Create Users A, B, C
  const timestamp = Date.now();
  const userA = await User.create({
    googleSub: `sub-user-a-${timestamp}`,
    email: `usera_${timestamp}@example.com`,
    firstName: 'Alice',
    role: 'USER',
    isActive: true
  });

  const userB = await User.create({
    googleSub: `sub-user-b-${timestamp}`,
    email: `userb_${timestamp}@example.com`,
    firstName: 'Bob',
    role: 'USER',
    isActive: true
  });

  const userC = await User.create({
    googleSub: `sub-user-c-${timestamp}`,
    email: `userc_${timestamp}@example.com`,
    firstName: 'Charlie',
    role: 'USER',
    isActive: true
  });

  console.log(`User A (Alice):   ${userA._id}`);
  console.log(`User B (Bob):     ${userB._id}`);
  console.log(`User C (Charlie): ${userC._id}`);

  // ----------------------------------------------------
  // TEST 1: Private Note Isolation
  // ----------------------------------------------------
  // User A creates a private personal note
  const noteA = await Note.create({
    userId: userA._id,
    content: "Alice's secret algorithm notes",
    title: "Secret DP",
    color: "#fef08a"
  });

  // User B tries to update User A's note
  let userBUpdateFailed = false;
  try {
    const { req: updateReq, res: updateRes } = createMockReqRes({
      user: userB,
      params: { id: noteA._id.toString() },
      body: { content: "Bob hacked Alice's note!" }
    });
    await noteController.updateNote(updateReq, updateRes);
    if (updateRes.statusCode >= 400) userBUpdateFailed = true;
  } catch (err) {
    userBUpdateFailed = true;
  }

  assert(userBUpdateFailed, "User B MUST NOT be able to modify User A's private note");
  const noteAReloaded = await Note.findById(noteA._id);
  assert.strictEqual(noteAReloaded.content, "Alice's secret algorithm notes", "User A note content remains intact");
  console.log("PASS [1/5]: Cross-user Note mutation blocked (User B cannot modify User A's private note)");

  // ----------------------------------------------------
  // TEST 2: Notification Isolation
  // ----------------------------------------------------
  // Create an unread notification for User A
  const notifA = await Notification.create({
    senderId: userC._id,
    receiverId: userA._id,
    projectId: new mongoose.Types.ObjectId(),
    title: "Alice Notification",
    message: "Welcome Alice",
    notificationStatus: false
  });

  // User B attempts to mark User A's notification as read
  const { req: notifReq, res: notifRes } = createMockReqRes({
    user: userB,
    params: { id: notifA._id.toString() }
  });
  await notificationController.updateNotification(notifReq, notifRes);

  assert(notifRes.statusCode === 404 || notifRes.statusCode === 403, "User B must not be able to mark User A's notification");
  const notifAReloaded = await Notification.findById(notifA._id);
  assert.strictEqual(notifAReloaded.notificationStatus, false, "User A notification remains unread");
  console.log("PASS [2/5]: Notification IDOR blocked (User B cannot mutate User A's notification)");

  // ----------------------------------------------------
  // TEST 3: Analytics Member-Stats IDOR Isolation
  // ----------------------------------------------------
  // User B attempts to access User A's member statistics
  let analyticsFailed = false;
  try {
    const { req: statReq, res: statRes } = createMockReqRes({
      user: userB,
      params: { userId: userA._id.toString() }
    });
    await analyticsController.getMemberStats(statReq, statRes);
    if (statRes.statusCode === 403) analyticsFailed = true;
  } catch (err) {
    if (err.statusCode === 403) analyticsFailed = true;
  }

  assert(analyticsFailed, "User B must receive 403 Forbidden when requesting User A's stats");
  console.log("PASS [3/5]: Analytics IDOR blocked: Non-admin cannot query another member's performance stats");

  // ----------------------------------------------------
  // TEST 4: Focus Session Isolation
  // ----------------------------------------------------
  // User A creates a focus session
  const sessionA = await FocusSession.create({
    user: userA._id,
    startTime: new Date(),
    endTime: new Date(),
    duration: 45,
    type: "Focus",
    taskName: "Graph Problem",
    statusAtCompletion: "done"
  });

  // User B attempts to delete User A's focus session
  const { req: delReq, res: delRes } = createMockReqRes({
    user: userB,
    params: { id: sessionA._id.toString() }
  });
  await FocusController.deleteSession(delReq, delRes);

  assert.strictEqual(delRes.statusCode, 404, "User B must receive 404 when attempting to delete User A's session");
  const sessionAReloaded = await FocusSession.findById(sessionA._id);
  assert(sessionAReloaded, "User A focus session must still exist in DB");
  console.log("PASS [4/5]: Focus session deletion isolation verified (User B cannot delete User A's session)");

  // ----------------------------------------------------
  // TEST 5: User C Data Clean Slate & Triple Invariant
  // ----------------------------------------------------
  // User C queries notes
  const { req: getNotesReq, res: getNotesRes } = createMockReqRes({ user: userC });
  await noteController.getNotes(getNotesReq, getNotesRes);
  const userCNotes = getNotesRes.responseData?.data || [];
  assert.strictEqual(userCNotes.length, 0, "User C must see 0 notes initially");

  console.log("PASS [5/5]: User C has completely clean isolated data: A != B != C confirmed");

  // Cleanup
  await Note.deleteMany({ userId: { $in: [userA._id, userB._id, userC._id] } });
  await Notification.deleteMany({ _id: notifA._id });
  await FocusSession.deleteMany({ _id: sessionA._id });
  await User.deleteMany({ _id: { $in: [userA._id, userB._id, userC._id] } });

  console.log('\n=== ALL DEEP USER ISOLATION TESTS PASSED ===\n');
  process.exit(0);
}

runDeepUserIsolationTests().catch((err) => {
  console.error('Deep User Isolation Tests Failed:', err);
  process.exit(1);
});
