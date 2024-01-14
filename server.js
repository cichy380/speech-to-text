const express = require('express');
const multer = require('multer');
const cors = require('cors');
const speech = require('@google-cloud/speech');
const upload = multer();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const client = new speech.SpeechClient({
        keyFilename: 'speech-to-text-01-411118-01d4c048f21b.json'
    });
    const audio = {
        content: req.file.buffer,
    };
    const config = {
        encoding: 'audio/wav',
        sampleRateHertz: 48000,
        languageCode: 'pl-PL',
    };
    const request = {
        config,
        audio
    };
    const [response] = await client.recognize(request);

    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

    res.send(transcription);
});

app.listen(3000, () => console.log('Listening on port 3000'));