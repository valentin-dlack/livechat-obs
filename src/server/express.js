const express = require('express');
const path = require('path');

function setupExpressServer() {
    const app = express();

    app.use(express.static('../../public'));
    
    app.set('view engine', 'ejs');
    app.use(express.static('public'));

    app.get('/view/:channelId', (req, res) => {
        const channelId = req.params.channelId;
        res.render('index', { channelId });
    });

    return app;
}

module.exports = setupExpressServer;
