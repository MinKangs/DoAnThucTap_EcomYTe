const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/session', chatController.initSession);
router.get('/session/:session_token/messages', chatController.getMessages);
router.post('/message', chatController.sendMessage);
router.get('/sessions', chatController.getAllSessions);
router.delete('/session/:id', chatController.deleteSession);
router.put('/session/:session_token/read', chatController.markAsRead);
router.get('/unread-total', chatController.getUnreadTotal);

module.exports = router;