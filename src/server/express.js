import express from 'express';

function setupExpressServer() {
    const app = express();
    
    app.set('view engine', 'ejs');
    app.use(express.static('public'));

    app.get('/view/:channelId', (req, res) => {
        const channelId = req.params.channelId;
        res.render('index', { channelId });
    });

    return app;
}

export default setupExpressServer;
