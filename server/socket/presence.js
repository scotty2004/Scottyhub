// socket/presence.js
//
// Tracks who's currently connected via Socket.IO. Pulled out into its own
// file (instead of living in socket/chat.js) specifically so routes/roomchat.js
// and routes/messages.js can check "is this user online?" without creating a
// circular require (chat.js already depends on roomchat.js to send messages).

const { db } = require('../db');

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

module.exports = { onlineUsers, markOnline, markOffline };
