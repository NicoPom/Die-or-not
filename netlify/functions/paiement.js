import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { getUserByNetlifyId } from "../../database";

export const handler = async (event, context) => {
  // TODO : authorization check

  const { user } = context.clientContext;

  const result = await getUserByNetlifyId(user.sub);

  const { stripe_id } = result[0];

  return {
    statusCode: 200,
    body: JSON.stringify({
      customerId: stripe_id,
    }),
  };
};
