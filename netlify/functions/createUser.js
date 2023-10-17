import { createUser } from "../../database";

export const handler = async (event, context) => {
  // your server-side functionality
  const { user } = JSON.parse(event.body);
  const newUser = await createUser(user);
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(newUser),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
