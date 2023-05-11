const axios = require('axios');

const dotenv = require('dotenv');
const prompt = 'Hello, ChatGPT!';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const data = {
  prompt: "some word that not change the current context",
  max_tokens: 50,
  temperature: 0.5,
  n: 1,
  stop: '\n',
  model: 'davinci',
  context: 'This is a conversation between ChatGPT and the user.\n',
  conversation_id: 'example-conversation-id',
  // If this is a response to a previous message, include the ID of the previous message.
  // Otherwise, leave this field blank.
  // parent_message_id: 'example-parent-message-id',
};

axios
  .post(
    'https://api.openai.com/v1/engines/davinci-codex/completions',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )
  .then((response) => {
    console.log(response.data.choices[0].text);
    console.log(response.data.choices[0].finish_reason);
    console.log(response.data.choices[0].index);
    console.log(response.data.choices[0].logprobs);
    console.log(response.data.choices[0].text);
    console.log(response.data.choices[0].context);
  })
  .catch((error) => {
    console.error(error);
  });
  