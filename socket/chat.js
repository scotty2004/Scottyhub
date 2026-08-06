const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { assertRoomAccess, createRoomMessage } = require('../routes/roomchat');

// userId -> Set of connected socket ids. A user can have several tabs/devices
// open at once, so we only broadcast "online"/"offline" on the first
// connect / last disconnect for that user.
const onlineUsers = new Map();

function markOnline(io, userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  const wasOffline = onlineUsers.get(userId).size === 0;
  onlineUsers.get(userId).add(socketId);
  if (wasOffline) io.emit('presence:update', { userId, online: true });
}

function markOffline(io, userId, socketId) {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    io.emit('presence:update', { userId, online: false });
    db.execute({ sql: 'UPDATE users SET last_seen=NOW()::text WHERE id=?', args: [userId] }).catch(() => {});
  }
}

function attachSocket(io) {
  // Auth handshake: client connects with `io(url, { auth: { token } })`.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await db.execute({ sql: 'SELECT id, username, avatar FROM users WHERE id=?', args: [decoded.id] });
      if (!result.rows.length) return next(new Error('User not found'));
      socket.user = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    socket.join(`user:${user.id}`);   // personal room — DMs + notifications land here
    socket.join('community');          // global chatroom, everyone auto-joins
    socket.join('feed');               // live feed chat + live comment broadcasts

    try {
      const groups = await db.execute({ sql: 'SELECT group_id FROM group_members WHERE user_id=?', args: [user.id] });
      groups.rows.forEach(g => socket.join(`group:${g.group_id}`));
    } catch (e) { /* non-fatal */ }

    markOnline(io, user.id, socket.id);
    // Tell the newly-connected client who else is currently online.
    socket.emit('presence:snapshot', { onlineUserIds: Array.from(onlineUsers.keys()) });

    // ── Room chat (community / feed / group:<id>) ──
    // Lets a client join a group's room on demand (e.g. just joined the
    // group without a full page refresh) instead of only at connect time.
    socket.on('room:join', async ({ room }, ack) => {
      try {
        const allowed = await assertRoomAccess(room, user.id);
        if (allowed) socket.join(room);
        ack && ack({ ok: allowed });
      } catch (err) {
        ack && ack({ ok: false });
      }
    });

    socket.on('room:message', async ({ room, content }, ack) => {
      try {
        if (!room || !content || !content.trim()) return;
        const allowed = await assertRoomAccess(room, user.id);
        if (!allowed) return ack && ack({ error: 'Not allowed in this room' });
        const msg = await createRoomMessage(room, user.id, content);
        io.to(room).emit('room:message', msg);
        ack && ack({ ok: true, message: msg });
      } catch (err) {
        ack && ack({ error: 'Failed to send' });
      }
    });

    // ── Direct messages ──
    // Sending itself still goes through POST /api/messages/:convId (keeps one
    // source of truth for unread counts); this just relays typing + read
    // receipts + lets a socket join a conversation's "room" for convenience.
    socket.on('dm:typing', ({ toUserId }) => {
      if (toUserId) io.to(`user:${toUserId}`).emit('dm:typing', { fromUserId: user.id });
    });
    socket.on('dm:read', ({ convId, toUserId }) => {
      if (toUserId) io.to(`user:${toUserId}`).emit('dm:read', { convId, byUserId: user.id });
    });

    // ── Typing indicator for room chats ──
    socket.on('room:typing', ({ room }) => {
      if (room) socket.to(room).emit('room:typing', { room, username: user.username, userId: user.id });
    });

    socket.on('disconnect', () => {
      markOffline(io, user.id, socket.id);
    });
  });
}

module.exports = { attachSocket, onlineUsers };
