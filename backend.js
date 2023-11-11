const express = require('express');
const { join } = require('path');
const { readFileSync } = require('fs');
const { post } = require('node-superfetch');
require('dotenv').config();

/*
const app = express();
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});

app.listen(3000);
*/

async function detectObjects(image) { // image: /path/to/localImage.png
    const content = Buffer.from(readFileSync(image)).toString("base64");

    const res = await post("https://vision.googleapis.com/v1/images:annotate?key=" + process.env.GOOGLE, { headers: { 
        "Content-Type": "application/json; charset=utf-8",
    } }).send({
        "requests": [
            {
                "image": {
                    "content": content
                },
                "features": [
                    {
                        "maxResults": 3,
                        "type": "OBJECT_LOCALIZATION"
                    },
                ]
            }
        ]
    });

    if (res && res.body) {
        console.log(res.body.responses[0].localizedObjectAnnotations);
    }
}

detectObjects(join(__dirname, "test.jpeg"));