const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { default: axios } = require("axios");

//REGISTER
router.post('/register', async (req, res) => {
    if (req.body.showRecaptcha) {
        const result = await reCaptchaValidation(req.body.token);
        if (!result) {
            res.status(400).json('Recaptcha error');
            return;
        }
    }
    const accessToken = await generateAccessToken(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


//LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        !user && res.status(401).json('Wrong credentials!');

        const hasMatch = await bcrypt.compare(req.body.password, user._doc.password);

        if (!hasMatch) {
            throw new Error('Incorect password');
        }

        const accessToken = await generateAccessToken(user._doc);
        const refreshToken = await generateRefreshToken(user._doc);
        refreshTokens.push(refreshToken);

        const { password, ...others } = user._doc;
        const data = { ...others, accessToken, refreshToken }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
        console.log(err)
    }

});

let refreshTokens = [];

//REFRESH TOKEN
router.post('/refresh', async (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) return res.status(401).json("You are not authenticated!");
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json("Refresh token is not valid!");

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        err && console.log(err);
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        refreshTokens.push(refreshToken);

        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    });
});

//LOGOUT
router.post('/logout', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            throw new Error('No such user!')
        }
        const refreshToken = req.body.token;
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

        res.status(200).json("You logged out successfully");
    } catch (err) {
        res.status(500);
        res.send(err);
    }
});


async function reCaptchaValidation(token) {
    try {
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, { method: "POST" });
        return response.data.success;
    } catch (err) {
        return err;
    }
}

async function generateAccessToken(userData) {
    return jwt.sign({
        _id: userData._id,
        username: userData.username,
        email: userData.email
    }, process.env.TOKEN_SECRET, { expiresIn: "15m" });
}

async function generateRefreshToken(userData) {
    return jwt.sign({
        _id: userData._id,
        username: userData.username,
        email: userData.email
    }, process.env.REFRESH_TOKEN_SECRET);
}


module.exports = router