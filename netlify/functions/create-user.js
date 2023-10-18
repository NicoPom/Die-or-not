import { createUser } from "../../database";

export const handler = async (event, context) => {
  // your server-side functionality
  const { user } = context.clientContext;
  const { roles } = user.app_metadata;
  const userObj = {
    name: user.user_metadata.full_name,
    email: user.email,
    subscribed: roles && roles.includes("pro") ? 1 : 0,
    unique_id: user.sub,
  };
  const newUser = await createUser(userObj);
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
