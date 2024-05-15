const  express =  require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require ('openai');
const dotenv = require('dotenv');
const Filter  = require('bad-words');
//import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware.js';


const filter = new Filter();

// Load environment variables from .env file
try {
  require('dotenv').config();
  console.log(process.env.OPENAI_API_KEY)
  
} catch (error) {
  console.log(process.env.OPENAI_API_KEY)
  console.error('Error loading environment variables:', error);
  process.exit(1);
}

// Create OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});



// Create OpenAI API client
const openai = new OpenAIApi(configuration);

// Create Express app
const app = express();


// Parse JSON in request body
app.use(express.json());

// Enable CORS

// ratelimiter middleware function
//app.use('/davinci', rateLimitMiddleware);
//app.use('/dalle', rateLimitMiddleware);

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

/**
 * GET /
 * Returns a simple message.
 */
app.get('/', function(req, res) {
  res.status(200).send({
    message: 'Hello World!',
  });
});
/* utils
*
*   function checkIncludes( text)
*
 */
const models = [ "gpt-4o", "gpt-4-turbo", "gpt-4-turbo-preview", "gpt-4-vision-preview", "gpt-3.5-turbo"];

function checkIncludes(text) {
    for ( let cc = 0; cc <= 5; cc++){
        if ( text === models[cc]) return true;
    }
    return false
}

/**
 * POST /davinci
 * Returns a response from OpenAI's text completion model.
 */
app.post('/davinci', async function(req, res) {
  // Validate request body
  if (!req.body.prompt) {
    return res.status(400).send({
      error: 'Missing required field "prompt" in request body',
    })
  }
  
  try {
    // Call OpenAI API
    const { prompt, user, model } = req.body
    const { history } = req.body
    console.log("checking model" + model );
    let retvalue = checkIncludes( model);

    if (! retValue){
      res.status(404).send({success:false,message:`error: the model ${model} is not available.`})
      return;
    }

    const cleanPrompt = filter.isProfane(prompt) ? filter.clean(prompt) : prompt
    console.log(cleanPrompt)
    let out = [];
    out.push({"role": "system", "content": "you're an a AI assistant that replies to all my questions in markdown format."})
    let item = history.pop();
    console.log(history.length)
    for (let ii = 0; ii < history.length;ii++){
      item = history.pop();
    
      console.log(item)
      out.push({"role":"user", "content":item})
    }
    
    let promptItem = {"role": "user", "content": `${cleanPrompt}?`};
    out.push(promptItem)
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: out,
      user: "user",  // ? ?? ?
      temperature: 0.5,
      max_tokens: 2047,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0.2,
    })

    console.log(response.data.choices[0].message.content)
  console.log(response.data.choices[0].context)
    console.log(user)
    // Return response from OpenAI API
    res.status(200).send({
      bot: response.data.choices[0].message.content,
      context: response.data.choices[0].context,
      limit: 0
    })
  } catch (error) {
    // Log error and return a generic error message
    console.error(error)
    res.status(500).send({
      error: 'Something went wrong',
    })
  }
})

app.post('/davinci2old', async function(req, res) {
  // Validate request body
  if (!req.body.prompt ) {
    return res.status(400).send({
      error: 'Missing required field "prompt" in request body',
    });
  }

  try {
    // Call OpenAI API
    const prompt = req.body.prompt;
    const actualData= req.body.conversationId;
    const cleanPrompt = filter.isProfane(prompt) ? filter.clean(prompt) : prompt;
    console.log(cleanPrompt);

    // let list = await openai.listModels();
    

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `
I want you to reply to all my questions in markdown format. 
Q: ${cleanPrompt}?.
A: `,
      temperature: .1,
      max_tokens: 1024,
      top_p: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.2,
      
    
    });

    console.log(response.data.choices[0].text)
    // Return response from OpenAI API
    res.status(200).send({
      bot: response.data.choices[0].text,
      context: response.data.choices[0].context,
      limit: 0
    });
    // response.data  ALTRI CAMPI
    // MODEL,.CHOICES,.USAGE
    //************************
    //.usage TODO"usage": { "prompt_tokens": 5, "completion_tokens": 5, "total_tokens": 10 } }
  } catch (error) {
    // Log error and return a generic error message
    console.error(error);
    res.status(500).send({
      error: 'Something went wrong',
    });
    console.log(error.data)
  }
});

/**
 * POST /dalle
 * Returns a response from OpenAI's image generation model.
 */
app.post('/dalle2', async function(req, res)  {
  const prompt = req.body.prompt;

  try {
    const response = await openai.createImage({
      prompt: `${prompt}`,
      n: 1,
      size: "256x256",
      response_format:"url"
    });
    
    console.log(response.data.data[0].url)
    res.status(200).send({
      bot: response.data.data[0].url,
      limit: 0
    });
  } catch (error) {
    // Log error and return a generic error message
    console.error(error);
    res.status(500).send({
      error: 'Something went wrong',
    });
  }
});

const generateImage = require('./api/dalle');

app.post('/dalle', async function(req,res) {
  const prompt = req.body.prompt
  
  let image = generateImage(prompt)


  res.status(200).send({
    imageUrl : image
  })
})

// Start server
// const PORT = process.env.PORT || 3001;
// app.listen(port, ()  console.log(`Server listening on port ${port}`));
// app.listen(PORT, function(err) {
//   if (err) {
//     console.error(err)
//   } else {
//     console.log(`Running on port ${PORT}`)
//   }
// })
// app.options ("*", (req, res) => {
//   res.header(
//     {
//       'Access-Control-Allow-Origin':'*',
//       'Access-Control-Allow-Methods':'GET,POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type'
//     })
  // res.header( 'Access-Control-Allow-Credentials', true)
  // # try: 'POST, GET, PUT, DELETE, OPTIONS'

  // # try: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'

 

  // # ...
// appZ.listen( 8888, function (err){})
//  app.listen( 3000, function (err){})

module.exports = app;

