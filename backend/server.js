require('dotenv').config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const app = express();

// Utilise la clé Stripe depuis une variable d'environnement
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  const { amount, email, nom, dateDebut, heureDebut, dateFin, heureFin, prix, bateauId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Acompte location bateau",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      metadata: { nom, dateDebut, heureDebut, dateFin, heureFin, prix, bateauId },
      success_url: "https://bbyatch-frontend.vercel.app/felicitation?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://bbyatch-frontend.vercel.app/confirmation?canceled=true",
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Erreur Stripe Checkout:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/checkout-session", async (req, res) => {
  const { session_id } = req.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("Stripe backend démarré sur http://localhost:4242"));
