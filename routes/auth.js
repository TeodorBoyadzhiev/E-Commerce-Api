const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");

//REGISTER
router.post('/register', async (req, res) => {
    const result = await reCaptchaValidation(req.body.token);
    if (!result) {
        res.status(400).json('Recaptcha error');
        return;
    }
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: 'dasa', // HAVE TO FIX ENCRYPTING ISSUE
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

        // const hashPassword = CryptoJS.AES.decrypt(
        //     user.password, process.env.PASS_SEC
        // );
        // const originalPassword = hashPassword.toString(CryptoJS.enc.Utf8);

        // originalPassword !== req.body.password && res.status(401).json('Wrong credentials!');

        // const accessToken = jwt.sign({
        //     id: user._id,
        //     isAdmin: user.isAdmin
        // }, process.env.JWT_SEC,
        //     { expiresIn: '3d' }
        // );

        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
        console.log(err)
    }

});


async function reCaptchaValidation(token) {
    try {
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, { method: "POST" });
        return response.data.success;
    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }
}


module.exports = router