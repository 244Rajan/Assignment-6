const express = require('express');
const app = express();
require('dotenv').config();

const authData = require('./modules/auth-service');
const legoSetsData = require('./modules/legoSets');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to serve static files
app.use(express.static('public'));

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Initialize services
authData.initialize()
    .then(legoSetsData.initialize)
    .then(() => {
        app.listen(process.env.PORT || 8080, () => {
            console.log("Server started on port 8080");
        });
    }).catch((err) => {
        console.error("Unable to start server: ", err);
    });

// Routes

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.redirect('/login');
    }).catch((err) => {
        res.render('register', { errorMessage: err });
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    authData.checkUser(req.body).then((user) => {
        req.session.user = user;
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render('login', { errorMessage: err });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/lego/sets', (req, res) => {
    legoSetsData.getAllSets().then((sets) => {
        res.render('sets', { sets: sets });
    }).catch((err) => {
        res.status(500).json({ error: err });
    });
});

app.post('/lego/addSet', (req, res) => {
    legoSetsData.addSet(req.body).then(() => {
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.status(500).json({ error: err });
    });
});

app.post('/lego/editSet/:setNum', (req, res) => {
    legoSetsData.editSet(req.params.setNum, req.body).then(() => {
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.status(500).json({ error: err });
    });
});

app.get('/lego/deleteSet/:setNum', (req, res) => {
    legoSetsData.deleteSet(req.params.setNum).then(() => {
        res.redirect('/lego/sets');
    }).catch((err) => {
        res.status(500).json({ error: err });
    });
});

// Error handling for 404 pages
app.use((req, res) => {
    res.status(404).render('404', { message: "Page Not Found" });
});
