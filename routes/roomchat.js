const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { protect } = require('../middleware/auth');

// Rooms are either a fixed name ('community', 'feed') that any logged-in
// user can post to, or 'group:<groupId>' which requires membership.
async function assertRoomAccess(room, userId) {
  if (room === 'community' || room === 'feed') return true;
  if (room.startsWith('group:')) {
    const groupId = room.slice('group:'.length);
    const m = await db.execute({
      sql: 'SELECT 1 FROM group_members WHERE group_id=? AND user_id=?',
      args: [groupId, userId]
    });
    return m.rows.length > 0;
  }
  return false;
}

// Inserts + returns the full row (with sender info) for a room message.
// Shared by the REST POST route and the socket 'room:message' handler so
// there's exactly one code path that writes to room_messages.
async function createRoomMessage(room, senderId, content, type = 'text') {
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.execute({
    sql: 'INSERT INTO room_messages (id, room, sender_id, content, type, created_at) VALUES (?,?,?,?,?,?)',
    args: [id, room, senderId, content.trim(), type, now]
  });
  const row = await db.execute({
    sql: `SELECT m.id, m.room, m.content, m.type, m.deleted, m.created_at,
                 u.id as sender_id, u.username as sender_name, u.avatar as sender_avatar
          FROM room_messages m JOIN users u ON m.sender_id = u.id WHERE m.id=?`,
    args: [id]
  });
  return row.rows[0];
}

// GET /api/roomchat/:room — paginated history (?before=<ISO ts>)
router.get('/:room', protect, async (req, res) => {
  try {
    const room = req.params.room;
    const allowed = await assertRoomAccess(room, req.user.id);
    if (!allowed) return res.status(403).json({ message: 'Not a member of this room' });

    const before = req.query.before || new Date(Date.now() + 60000).toISOString();
    const msgs = await db.execute({
      sql: `SELECT m.id, m.room, m.content, m.type, m.deleted, m.created_at,
                   u.id as sender_id, u.username as sender_name, u.avatar as sender_avatar
            FROM room_messages m JOIN users u ON m.sender_id = u.id
            WHERE m.room=? AND m.created_at < ?
            ORDER BY m.created_at DESC
            LIMIT 50`,
      args: [room, before]
    });
    res.json({ messages: msgs.rows.reverse() });
  } catch (err) {
    console.error('GET roomchat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/roomchat/:room — send a message (fallback for when a socket
// isn't connected; real-time delivery happens over the socket event below)
router.post('/:room', protect, async (req, res) => {
  try {
    const room = req.params.room;
    const { content, type = 'text' } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Empty message' });

    const allowed = await assertRoomAccess(room, req.user.id);
    if (!allowed) return res.status(403).json({ message: 'Not a member of this room' });

    const msg = await createRoomMessage(room, req.user.id, content, type);
    const io = req.app.get('io');
    if (io) io.to(room).emit('room:message', msg);

    res.status(201).json({ message: msg });
  } catch (err) {
    console.error('POST roomchat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, assertRoomAccess, createRoomMessage };
