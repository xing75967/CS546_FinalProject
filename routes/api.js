import { Router } from 'express';
import { toggleBookmark } from '../data/users.js';

const router = Router();

const checkLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to do that.' });
    }
    next();
};

router.route('/tools/:id/bookmark').post(checkLoggedIn, async (req, res) => {
    const toolId = req.params.id;
    const userId = req.session.user._id;
    try {
        const result = await toggleBookmark(userId, toolId);
        res.json({ success: true, bookmarked: result.bookmarked });
    } catch (e) {
        res.status(500).json({ success: false, error: 'Operation failed, please try again.' });
    }
});

export default router;
