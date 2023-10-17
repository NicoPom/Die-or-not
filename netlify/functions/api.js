import OpenAI from "openai";

export const handler = async (event, context) => {
  // your server-side functionality
  const { text } = event.queryStringParameters;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openaiApi = async (text) => {
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
    return answer;
  };

  return {
    statusCode: 200,
    body: await openaiApi(text),
  };
};
