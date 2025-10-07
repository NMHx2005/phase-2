import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import clientRoutes from './client.routes';
import usersRoutes from './users.routes';
import groupsRoutes from './groups.routes';
import groupRequestsRoutes from './group-requests.routes';
import channelsRoutes from './channels.routes';
import messagesRoutes from './messages.routes';
import messageReactionRoutes from './message-reaction.routes';
import messageReplyRoutes from './message-reply.routes';
import uploadRoutes from './upload.routes';
import videoCallRoutes from './video-call.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/client', clientRoutes);
router.use('/users', usersRoutes);
router.use('/groups', groupsRoutes);
router.use('/group-requests', groupRequestsRoutes);
router.use('/channels', channelsRoutes);
router.use('/messages', messagesRoutes);
router.use('/messages', messageReactionRoutes);
router.use('/messages', messageReplyRoutes);
router.use('/upload', uploadRoutes);
router.use('/video-calls', videoCallRoutes);

export default router;
