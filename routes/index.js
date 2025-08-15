import userRoutes from './users.js';
import toolRoutes from './tools.js';
import profileRoutes from './profile.js';
import searchRoutes from './search.js';
import adminRoutes from './admin.js';
import apiRoutes from './api.js';
import { getTopRatedTools } from '../data/tools.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsData = fs.readFileSync(path.resolve(__dirname, '../config/settings.json'), 'utf-8');
const settings = JSON.parse(settingsData);

const constructorMethod = (app) => {
  app.use((req, res, next) => {
      res.locals.isAdmin = req.session.user && req.session.user.email === settings.adminEmail;
      next();
  });
  app.use('/users', userRoutes);
  app.use('/tools', toolRoutes);
  app.use('/profile', profileRoutes);
  app.use('/search', searchRoutes);
  app.use('/admin', adminRoutes);
  app.use('/api', apiRoutes);
  app.get('/', async (req, res) => {
    try {
        const topToolsList = await getTopRatedTools();
        res.render('index', { title: 'Home', topTools: topToolsList });
    } catch (e) {
        res.status(500).render('error', {title: 'Server Error', error: 'Could not load homepage data.'});
    }
  });
  app.use('*', (req, res) => {
    res.status(404).render('error', {title: '404: Not Found', error: 'The page you are looking for does not exist.'});
  });
};

export default constructorMethod;
