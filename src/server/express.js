import express from 'express';
import paintSession from '../services/paintSession.js';

function setupExpressServer() {
    const app = express();
    
    app.set('view engine', 'ejs');
    app.use(express.static('public'));

    app.get('/view/:channelId', (req, res) => {
        const channelId = req.params.channelId;
        res.render('index', { channelId });
    });

    app.get('/paint/:sessionId', (req, res) => {
        const sessionId = req.params.sessionId;
        const session = paintSession.getSession(sessionId);

        if (!session || !session.isActive) {
            return res.status(404).send('Session inexistante ou terminée.');
        }

        res.render('paint', { sessionId, session });
    });
    
    return app;
}

export default setupExpressServer;
