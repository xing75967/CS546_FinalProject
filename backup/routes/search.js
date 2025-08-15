import { Router } from 'express';
import { searchTools } from '../data/tools.js';

const router = Router();

router.route('/').get(async (req, res) => {
    const query = req.query.query;
    if (!query || query.trim().length === 0) {
        return res.render('toolList', { pageTitle: 'Please enter keywords to search', tools: [] });
    }
    try {
        const searchResults = await searchTools(query);
        res.render('toolList', { pageTitle: `Search Results`, query: query, tools: searchResults });
    } catch (error) {
        res.status(500).render('error', { title: 'Search Error', error: 'An error occurred during the search.' });
    }
});

export default router;
