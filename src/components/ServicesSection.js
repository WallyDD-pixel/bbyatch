import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ServicesSection() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const servicesDoc = doc(db, "settings", "services");
      const servicesSnap = await getDoc(servicesDoc);
      if (servicesSnap.exists() && servicesSnap.data()) {
        const services = servicesSnap.data();
        const imgs = [];
        if (services.Image1) imgs.push(services.Image1);
        if (services.Image2) imgs.push(services.Image2);
        setImages(imgs);
      }
    }
    fetchImages();
  }, []);

  return (
    <section className="py-5" style={{ background: '#fafbfc' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '48px 40px',
          border: '1px solid #e1e5e9',
          position: 'relative'
        }}>
          {/* Ligne décorative */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 40,
            right: 40,
            height: 4,
            background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)',
            borderRadius: '0 0 2px 2px'
          }}></div>

          <h2 className="text-center mb-5" style={{ 
            fontWeight: 700, 
            fontSize: 32, 
            color: '#2c3e50',
            letterSpacing: -0.5,
            paddingTop: 8
          }}>
            Plus de services BB Yachts
          </h2>
          
          <div className="row justify-content-center g-4">
            {images.map((img, idx) => (
              <div key={idx} className="col-12 col-md-6">
                <div style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  background: '#fff',
                  border: '1px solid #e1e5e9',
                  transition: 'all 0.3s ease',
                  height: window.innerWidth < 600 ? 220 : 400
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                }}
                >
                  <img 
                    src={img} 
                    alt={`Service ${idx + 1}`} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
