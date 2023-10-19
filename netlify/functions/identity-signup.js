import { createUser } from "../../database";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event, context) => {
  // your server-side functionality
  const { user } = JSON.parse(event.body);

  console.log(user);

  // create a new customer in Stripe
  const customer = await stripe.customers.create({
    email: user.email,
  });

  // subscribe the new customer to the free plan
  await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.STRIPE_DEFAULT_PRICE_PLAN }],
  });

  // create a new user object to be saved in the database
  const userObj = {
    name: user.user_metadata.full_name,
    email: user.email,
    role: "free",
    netlify_id: user.sub,
    stripe_id: customer.id,
  };

  // save the user in the database
  await createUser(userObj);

  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          roles: "free",
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
