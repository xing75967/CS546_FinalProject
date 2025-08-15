import { Router } from 'express';
import { createTool, getToolById, addReviewToTool } from '../data/tools.js';
import { getUserById, toggleBookmark } from '../data/users.js';

const router = Router();

const checkLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        req.session.errorMessage = 'You must be logged in to do that.';
        return res.redirect('/users/login');
    }
    next();
};

router.route('/').post(checkLoggedIn, async (req, res) => {
    const { name, officialUrl, category, techStack, summary } = req.body;
    try {
        const userId = req.session.user._id;
        const result = await createTool(name, officialUrl, category, techStack, summary, userId);
        if (result.insertedTool) {
            req.session.successMessage = `Thanks for your submission! The tool "${name}" is now pending review.`;
            res.redirect(`/tools/${result.toolId.toString()}`);
        }
    } catch (e) {
        req.session.errorMessage = typeof e === 'string' ? e : 'An error occurred during submission.';
        res.status(400).render('addTool', { title: 'Submit New Tool', hasError: true, error: req.session.errorMessage, toolData: req.body });
    }
});

router.route('/new').get(checkLoggedIn, async (req, res) => {
    res.render('addTool', { title: 'Submit New Tool' });
});

router.route('/:id').get(async (req, res) => {
    const toolId = req.params.id;
    try {
        const tool = await getToolById(toolId);
        let isBookmarked = false;
        if (req.session.user) {
            const user = await getUserById(req.session.user._id);
            isBookmarked = user.bookmarkedTools.some(id => id.toString() === toolId);
        }
        res.render('tool', { title: tool.name, tool: tool, isBookmarked: isBookmarked });
    } catch (error) {
        res.status(404).render('error', { title: 'Error', error: 'Tool not found.' });
    }
});

router.route('/:id/reviews').post(checkLoggedIn, async (req, res) => {
    const toolId = req.params.id;
    const { rating, comment } = req.body;
    const { _id: userId, username } = req.session.user;
    try {
        const result = await addReviewToTool(toolId, userId, username, rating, comment);
        if (result.reviewAdded) {
            req.session.successMessage = 'Your review has been successfully posted!';
            res.redirect(`/tools/${toolId}`);
        }
    } catch (e) {
        req.session.errorMessage = typeof e === 'string' ? e : 'An error occurred while posting the review.';
        res.redirect(`/tools/${toolId}`);
    }
});

router.route('/:id/bookmark').post(checkLoggedIn, async (req, res) => {
    const toolId = req.params.id;
    const userId = req.session.user._id;
    try {
        await toggleBookmark(userId, toolId);
        res.redirect(`/tools/${toolId}`);
    } catch (e) {
        req.session.errorMessage = 'Operation failed, please try again.';
        res.redirect(`/tools/${toolId}`);
    }
});

export default router;
