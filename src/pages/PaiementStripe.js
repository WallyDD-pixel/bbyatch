import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe("pk_test_51RfY0J4M2Ak28aOKeiATxWofn76KbIrNeZ9GatrJokl9GIW00ddi4HYRkOqlVDR2kr2fSmFjEehlYVFxhVnCxhkq00ANqIOlkl"); // Mets ici ta clé publique Stripe

export default function PaiementStripe() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const acompte = params.get("acompte");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    fetch("http://localhost:4242/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(Number(acompte) * 100) })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [acompte]);

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  return (
    <div className="container py-5">
      <h2>Paiement de l'acompte</h2>
      <p>Montant à régler : <b>{acompte} €</b></p>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
