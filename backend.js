const express = require('express');
const { post } = require('node-superfetch');
const { OpenAI } = require('openai');
require('dotenv').config();

const { readFileSync } = require('fs');
const { join } = require('path');

const openai = new OpenAI({
    apiKey: process.env.OPENAI
});

const app = express();
app.use(express.static(__dirname));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
});

app.post("/analyze", async (req, res) => {
    const content = req.body.image;

    var detection = await detectObjects(content);

    console.log(detection);

    res.json(detection);
});

app.listen(3000);

async function detectObjects(content) { // image: /path/to/localImage.png
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
                        "maxResults": 5,
                        "type": "OBJECT_LOCALIZATION"
                    },
                    {
                        "maxResults": 5,
                        "type": "TEXT_DETECTION"
                    },
                ]
            }
        ]
    });

    if (res && res.body && res.body.responses.length > 0) {
        if (!res.body.responses[0].localizedObjectAnnotations || res.body.responses[0].localizedObjectAnnotations.length == 0 || !res.body.responses[0].textAnnotations || res.body.responses[0].textAnnotations.length == 0) {
            return {
                objectAnnotations: [],
                textAnnotations: [],
            }
        }

        const objectAnnotations = [];
        const textAnnotations = [];

        if (res.body.responses[0].localizedObjectAnnotations && res.body.responses[0].localizedObjectAnnotations.length > 0) {
            var localizedObjectAnnotations = res.body.responses[0].localizedObjectAnnotations.filter(x => x.name.toLowerCase() != "packaged goods" && x.score >= 0.7).filter((x, i, a) => a.map(y => y.name).indexOf(x.name) == i).slice(0, 1);

            console.log(localizedObjectAnnotations.length);

            for (var i = 0; i < localizedObjectAnnotations.length; i++) {
                const disposal = await openai.chat.completions.create({
                    messages: [{ role: "user", content: `How do I dispose of ${localizedObjectAnnotations[i].name} in Calgary, Alberta? Provide your answer in one sentence.` }],
                    model: "gpt-3.5-turbo",
                });

                if (disposal.choices && disposal.choices[0] && disposal.choices[0].message) {
                    objectAnnotations.push({
                        name: localizedObjectAnnotations[i].name,
                        score: localizedObjectAnnotations[i].score,
                        bounding: localizedObjectAnnotations[i].boundingPoly.normalizedVertices,
                        disposal: disposal.choices[0].message.content,
                    });
                }
            }
        }

        if (res.body.responses[0].textAnnotations && res.body.responses[0].textAnnotations.length > 0) {
            var normalizedText = res.body.responses[0].textAnnotations[0].description.replace(/\n/g, " ");
            
            console.log(normalizedText);

            const product = await openai.chat.completions.create({
                messages: [{ role: "user", content: `What is the product given by "${normalizedText}"? Answer in up to 3 words, and do not answer in a full sentence.` }],
                model: "gpt-3.5-turbo",
            });

            if (product.choices && product.choices[0] && product.choices[0].message) {
                console.log(product.choices[0].message.content);

                const disposal = await openai.chat.completions.create({
                    messages: [{ role: "user", content: `How do I dispose of ${product.choices[0].message.content} in Calgary, Alberta? Provide your answer in one sentence.` }],
                    model: "gpt-3.5-turbo",
                });

                if (disposal.choices && disposal.choices[0] && disposal.choices[0].message) {
                    textAnnotations.push({
                        name: product.choices[0].message.content,
                        disposal: disposal.choices[0].message.content,
                    });
                }
            }
        }

        return {
            objectAnnotations,
            textAnnotations,
        }
    } else {
        console.log("Return failed.")
        return {
            objectAnnotations: [],
            textAnnotations: [],
        }
    }

    /*
    [
        {
            name
            score
            bounding
            disposal
        }
    ]
    */
}

async function getDisposal() {

}