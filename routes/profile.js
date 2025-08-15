import { Router } from 'express';
import { getUserById, updateUser } from '../data/users.js';
import { getToolsByUserId, getToolsByIds } from '../data/tools.js';

const router = Router();

const checkLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/users/login');
    }
    next();
};

router.route('/').get(checkLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await getUserById(userId);
        const submittedTools = await getToolsByUserId(userId);
        const bookmarkedTools = await getToolsByIds(user.bookmarkedTools);
        const formattedSubmittedTools = submittedTools.map(tool => ({ ...tool, submissionDate: new Date(tool.submissionDate).toLocaleDateString() }));
        res.render('profile', { title: 'Profile', user: user, submittedTools: formattedSubmittedTools, bookmarkedTools: bookmarkedTools });
    } catch (error) {
        res.status(500).render('error', { title: 'Server Error', error: 'Could not load your profile.' });
    }
});

router.route('/edit').get(checkLoggedIn, async (req, res) => {
    try {
        const user = await getUserById(req.session.user._id);
        res.render('editProfile', { title: 'Edit Profile', user: user });
    } catch (e) {
        res.status(404).render('error', { title: 'Error', error: 'User information not found.' });
    }
});

router.route('/edit').post(checkLoggedIn, async (req, res) => {
    const userId = req.session.user._id;
    const { username, avatarUrl } = req.body;
    try {
        const updatedUser = await updateUser(userId, { username, avatarUrl });
        req.session.user = { ...req.session.user, username: updatedUser.username, avatarUrl: updatedUser.avatarUrl };
        req.session.successMessage = 'Your profile has been updated successfully!';
        res.redirect('/profile');
    } catch (e) {
        req.session.errorMessage = typeof e === 'string' ? e : 'Update failed, please check your input.';
        res.status(400).render('editProfile', { title: 'Edit Profile', hasError: true, error: req.session.errorMessage, user: { ...req.session.user, ...req.body } });
    }
});

export default router;
