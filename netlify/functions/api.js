import OpenAI from "openai";
import { addApiCallCount, getUserByNetlifyId } from "../../database";

// const maxApiCalls = 3;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event, context) => {
  // authorization check
  // const { user } = context.clientContext;
  // const userId = user.sub;
  // const { roles } = user.app_metadata;
  // const [databaseUser] = await getUserByNetlifyId(userId);
  // const { api_calls } = databaseUser;

  // if user is not logged in or exceed the api call limit as a free user, or hasn't a role (maybe cancelled subscription)
  // if (
  //   !roles ||
  //   roles.length === 0 ||
  //   (roles.includes("free") && api_calls >= maxApiCalls)
  // ) {
  //   return {
  //     statusCode: 401,
  //     body: "You've used up your free requests. Upgrade to Pro for €2/month for unlimited requests.",
  //   };
  // }

  // server-side functionality
  const { text } = event.queryStringParameters;

  try {
    const result = await spicyOrNot(text);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    // Log server-side
    console.error("Error in handler:", error);

    // Return the error to the client
    return {
      statusCode: 500,
      body: JSON.stringify({error:"Internal Server Error"})
    };
  }
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
  const answer = response.choices[0].message.content.trim().toLowerCase();

  // increment the api call count
  // await addApiCallCount(userId);

  return answer === "yes" // return true or false
};
