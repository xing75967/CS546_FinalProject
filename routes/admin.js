import { Router } from 'express';
import { getPendingTools, getManagedTools, updateToolStatus, deleteToolById } from '../data/tools.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsData = fs.readFileSync(path.resolve(__dirname, '../config/settings.json'), 'utf-8');
const settings = JSON.parse(settingsData);

const router = Router();
const adminEmail = settings.adminEmail;

const checkIsAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.email !== adminEmail) {
        return res.status(403).render('error', { title: 'Access Denied', error: 'You do not have permission to view this page.' });
    }
    next();
};

router.use(checkIsAdmin);

router.route('/').get(async (req, res) => {
    try {
        const pendingTools = await getPendingTools();
        const managedTools = await getManagedTools();
        res.render('adminDashboard', { title: 'Admin Dashboard', pendingTools: pendingTools, managedTools: managedTools, layout: 'main' });
    } catch (e) {
        res.status(500).render('error', { title: 'Server Error', error: 'Could not load management lists.' });
    }
});

router.route('/tools/:id/approve').post(async (req, res) => {
    try {
        await updateToolStatus(req.params.id, 'approved');
        req.session.successMessage = 'Tool has been approved.';
    } catch (e) {
        req.session.errorMessage = 'Operation failed.';
    }
    res.redirect('/admin');
});

router.route('/tools/:id/reject').post(async (req, res) => {
    try {
        await updateToolStatus(req.params.id, 'rejected');
        req.session.successMessage = 'Tool has been rejected.';
    } catch (e) {
        req.session.errorMessage = 'Operation failed.';
    }
    res.redirect('/admin');
});

router.route('/tools/:id/delete').post(async (req, res) => {
    try {
        await deleteToolById(req.params.id);
        req.session.successMessage = 'Tool has been successfully deleted.';
    } catch (e) {
        req.session.errorMessage = 'Deletion failed.';
    }
    res.redirect('/admin');
});

export default router;
