import { createUser } from "../../database";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PROD);

export const handler = async (event, context) => {
  const { user } = JSON.parse(event.body);

  // // create a new customer in Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.user_metadata.full_name,
  });

  // // subscribe the new customer to the free plan
  await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.STRIPE_DEFAULT_PRICE_PLAN }],
  });

  // // create a new user object to be saved in the database
  const userObj = {
    name: user.user_metadata.full_name,
    email: user.email,
    role: "free",
    netlify_id: user.id,
    stripe_id: customer.id,
  };

  // save the user in the database
  try {
    await createUser(userObj);
  } catch (error) {
    console.log(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        roles: ["free"],
      },
    }),
  };
};
