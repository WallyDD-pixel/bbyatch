import React from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/confirmation", // ou une page de succès
      },
    });
    if (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button className="btn btn-primary mt-3" disabled={loading || !stripe}>
        {loading ? "Paiement en cours..." : "Payer l'acompte"}
      </button>
      {message && <div className="alert alert-danger mt-2">{message}</div>}
    </form>
  );
}
