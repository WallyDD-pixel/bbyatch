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
    <div style={{
      maxWidth: '100%',
      margin: '0 auto',
      padding: window.innerWidth < 768 ? '20px 16px' : '24px 20px',
      background: '#ffffff',
      borderRadius: window.innerWidth < 768 ? 12 : 16,
      border: '1px solid #e1e5e9',
      boxShadow: window.innerWidth < 768 ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        marginBottom: window.innerWidth < 768 ? 20 : 24,
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: window.innerWidth < 768 ? 20 : 24,
          fontWeight: 700,
          color: '#2c3e50',
          marginBottom: 8
        }}>
          Paiement sécurisé
        </h3>
        <p style={{
          fontSize: window.innerWidth < 768 ? 14 : 16,
          color: '#6c757d',
          marginBottom: 0
        }}>
          Finalisez votre réservation en toute sécurité
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: window.innerWidth < 768 ? 16 : 20
      }}>
        <div style={{
          background: window.innerWidth < 768 ? '#f8f9fa' : '#ffffff',
          padding: window.innerWidth < 768 ? '16px' : '20px',
          borderRadius: window.innerWidth < 768 ? 8 : 12,
          border: window.innerWidth < 768 ? '1px solid #e9ecef' : '1px solid #dee2e6'
        }}>
          <PaymentElement 
            options={{
              style: {
                base: {
                  fontSize: window.innerWidth < 768 ? '16px' : '14px',
                  color: '#2c3e50',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  '::placeholder': {
                    color: '#6c757d',
                  },
                },
                invalid: {
                  color: '#dc3545',
                },
              },
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
            }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          type="submit"
          disabled={loading || !stripe}
          style={{
            padding: window.innerWidth < 768 ? '16px 24px' : '14px 20px',
            fontSize: window.innerWidth < 768 ? 16 : 14,
            fontWeight: 600,
            borderRadius: window.innerWidth < 768 ? 8 : 6,
            background: loading ? '#6c757d' : 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
            border: 'none',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            width: '100%',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading && stripe) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0, 102, 204, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && stripe) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Paiement en cours...
            </div>
          ) : (
            "Payer l'acompte"
          )}
        </button>

        {message && (
          <div style={{
            padding: window.innerWidth < 768 ? '12px 16px' : '10px 14px',
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: window.innerWidth < 768 ? 8 : 6,
            fontSize: window.innerWidth < 768 ? 14 : 13,
            fontWeight: 500,
            marginTop: 8
          }}>
            {message}
          </div>
        )}
      </form>

      {/* Indicateurs de sécurité pour mobile */}
      <div style={{
        marginTop: window.innerWidth < 768 ? 24 : 20,
        padding: window.innerWidth < 768 ? '16px' : '12px',
        background: '#e8f4fd',
        borderRadius: window.innerWidth < 768 ? 8 : 6,
        border: '1px solid #b8daff',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 24,
          height: 24,
          background: '#0066cc',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: '#ffffff',
          fontWeight: 'bold'
        }}>
          🔒
        </div>
        <p style={{
          fontSize: window.innerWidth < 768 ? 13 : 12,
          color: '#0066cc',
          margin: 0,
          fontWeight: 600
        }}>
          Vos données sont protégées par le cryptage SSL
        </p>
      </div>

      {/* CSS pour l'animation de loading */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
