import { createUser } from "../../database";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event, context) => {
  // TODO: authorization check

  const { user } = context.clientContext;

  // // create a new customer in Stripe
  const customer = await stripe.customers.create({
    email: user.email,
  });

  // TODO: check if the user already exists in the stripe database to avoid re-creating the customer

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
    netlify_id: user.sub,
    stripe_id: customer.id,
  };

  try {
    // save the user in the database
    const response = await createUser(userObj);

    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: { roles: ["free"] },
        user_metadata: user.user_metadata,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
