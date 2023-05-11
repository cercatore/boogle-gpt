const axios = require('axios');

const QUERY_URL = "https://api.openai.com/v1/images/generations";

// Your API key here
const API_KEY = "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";

const model = "image-alpha-001";
const prompt = "a cat sitting on a couch";
const num_images = 1;
const data = {
    model: model,
    prompt: prompt,
    num_images: num_images,
    size: "512x512",
    temperature:0
};
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };

function generateImage( promptImage ){
    let imageUrl;
    const data = {
        model: model,
        prompt: prompt,
        num_images: num_images,
        size: "512x512",
        temperature:0.5
    };  
    axios.post(QUERY_URL, data, { headers })
    .then((response) => {
        imageUrl = response.data.data[0].url;
        console.log(`Generated image: ${imageUrl}`);
    })
    .catch((error) => {
        console.error(`Failed to generate image: ${error}`);
    });

    return imageUrl;
}

module.exports = generateImage