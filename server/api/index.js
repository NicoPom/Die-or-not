import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config(); // load environment variables from .env file for local development
const app = express();
// const port = process.env.PORT || 3000;
const corsOptions = {
  origin: "https://spicy-or-not.vercel.app/",
};

// Allow requests from all origins (adjust this as needed)
app.use(cors(corsOptions));

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// Define a basic route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Define a route that uses the OpenAI API
app.get("/openai", async (req, res) => {
  // set CORS headers
  response.setHeader(
    "Access-Control-Allow-Origin",
    "https://spicy-or-not.vercel.app"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // handle request
  const { text } = req.query;
  const answer = await openaiApi(text);
  res.send(answer);
});

// This code is for v4 of the openai package: npmjs.com/package/openai

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function openaiApi(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Is ${text} spicy ? Answer by 'yes' or 'no' with no punctuation`,
      },
    ],
    temperature: 0.1,
    max_tokens: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const answer = response.choices[0].message.content;
  console.log(answer);
  return answer;
}

// export the express app
module.exports = app;
