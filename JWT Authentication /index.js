const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieparser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieparser());

const users = [{id:1, username:"hamza", password:"password"}];

const ACCESS_SECRET = process.env.ACCESS_SECRET || "accress_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";
const refreshTokenDB = new Set();

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({username, password: hashedPassword});
    res.status(201).json({message: "User Registered"})
});

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({error: "Invalid Creds"});
    }

    //Generate JWT Tokens
    const accessToken = generateAccessToken({username});
    const refreshToken = generateRefreshToken({username});

    refreshTokenDB.add(refreshToken);

    res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: true});
    res.json({accessToken, refreshToken});
});

function generateAccessToken(user){
    return jwt.sign(user, ACCESS_SECRET, {expiresIn: "15m"});
}

function generateRefreshToken(user){
    return jwt.sign(user, REFRESH_SECRET, {expiresIn: "7d"})
}

function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, ACCESS_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get("/protected", authenticateToken, (req,res) => {
    res.json({message: "protected Data", user: req.user});
});

app.post("/refresh", (req, res)=>{
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken || !refreshTokenDB.has(refreshToken)){
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user)=>{
        if (err) return res.sendStatus(403);

        refreshTokenDB.delete(refreshToken);
        const newAccessToken = generateAccessToken({username: user.username});
        const newRefreshToken = generateRefreshToken({username: user.username});


        refreshTokenDB.add(newRefreshToken);
        res.cookie("refreshToken", newRefreshToken, {httpOnly: true, secure: true});
        res.json({accessToken: newAccessToken})

    })
})

app.post("/logout", (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken){
        refreshTokenDB.delete(refreshToken);
    }

    res.clearCookie("refreshToken");
    res.json({message: "Logged Out"});
});


const PORT = 5000
app.listen(PORT, ()=>{
    console.log(`Server is Running on Port ${PORT}`)
})