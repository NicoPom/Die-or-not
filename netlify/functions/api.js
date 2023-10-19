import OpenAI from "openai";

const allowedRoles = ["admin", "pro"];
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event, context) => {
  // authorization check
  const { user } = context.clientContext;
  const { roles } = user.app_metadata;

  // if user is not logged in or doesn't have the right role
  if (!roles || !roles.some((role) => allowedRoles.includes(role))) {
    return {
      statusCode: 401,
      body: "To use this function you need to be logged in as a pro user",
    };
  }

  // your server-side functionality
  const { text } = event.queryStringParameters;

  return {
    statusCode: 200,
    body: JSON.stringify(await spicyOrNot(text)),
  };
};

const spicyOrNot = async (text) => {
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

  return answer === "yes" || answer === "Yes"; // return true or false
};
