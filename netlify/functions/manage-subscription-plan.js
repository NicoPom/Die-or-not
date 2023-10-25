import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { getUserByNetlifyId } from "../../database";

export const handler = async (event, context) => {
  const { user } = context.clientContext;

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: "You must be logged in to manage your subscription",
      }),
    };
  }

  const dbUser = await getUserByNetlifyId(user.sub);

  const { stripe_id } = dbUser[0];

  const link = await stripe.billingPortal.sessions.create({
    customer: stripe_id,
    return_url: process.env.URL,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(link.url),
  };
};
