require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

const urlStore = {
    next: 1,
    urls: [],
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
    const foundIndex = urlStore.urls.findIndex((el) => el.url === req.body.url?.trim());
    if (foundIndex > -1) {
        return res.json({ original_url: req.body.url, short_url: urlStore.urls[foundIndex].id });
    }

    if (!req.body.url.match(/^https?:\/\/www./g)) {
        return res.json({ error: "Invalid URL" });
    }
    let url = req.body.url?.replace(/^https?:\/\/www./g, "");
    url = url.replace(/\/$/g, "");

    dns.lookup(url, (err) => {
        if (err) {
            console.error(err);
            return res.sendStatus(400);
        }
    });

    urlStore.urls.push({ url: req.body.url, id: urlStore.next });
    res.json({ original_url: req.body.url, short_url: urlStore.next });

    urlStore.next = urlStore.next + 1;
});

app.get("/api/shorturl/:id", (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.json({ error: "Wrong format" });
    }

    const foundIndex = urlStore.urls.findIndex((el) => el.id === id);
    if (foundIndex > -1) {
        return res.redirect(301, urlStore.urls[foundIndex].url);
    }

    res.json({ error: "No short URL found for the given input" });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
