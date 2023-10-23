import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { getUserByStripeId } from "../../database";

export const handler = async (event, context) => {
  try {
    // make sure this event was sent legitimately.
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // bail if this is not a subscription update event
    if (stripeEvent.type !== "customer.subscription.updated") return;

    const subscription = stripeEvent.data.object;

    const dbUser = await getUserByStripeId(subscription.customer);

    const { netlify_id } = dbUser[0];

    // take the first word of the plan name and use it as the role
    const plan = subscription.items.data[0].plan.nickname;
    const role = plan.split(" ")[0].toLowerCase();

    console.log(plan, role);
    return {
      statusCode: 200,
      body: JSON.stringify({ netlify_id_of_the_changed_plan: netlify_id }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};
