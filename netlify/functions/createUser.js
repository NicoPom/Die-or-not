import { createUser } from "../../database";

export const handler = async (event, context) => {
  // your server-side functionality
  const { user } = JSON.parse(event.body);
  const newUser = await createUser(user);
  return {
    statusCode: 200,
    body: "User created : " + JSON.stringify(newUser),
  };
};
