import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { getUserByStripeId, updateUserRole } from "../../database";

export const handler = async ({ body, headers }, context) => {
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
    const role = subscription.items.data[0].plan.metadata.role;

    // update the user role in your database
    console.log(await updateUserRole(netlify_id, role));

    // send a call to the Netlify Identity admin API to update the user role
    const { identity } = context.clientContext;
    try {
      await fetch(`${identity.url}/admin/users/${netlify_id}`, {
        method: "PUT",
        headers: {
          // note that this is a special admin token for the Identity API
          Authorization: `Bearer ${identity.token}`,
        },
        body: JSON.stringify({
          app_metadata: {
            roles: [role],
          },
        }),
      });
    } catch (err) {
      console.log(err);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};
