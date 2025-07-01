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
    <section className="py-5 bg-white">
      <div className="container">
        <h2 className="text-center mb-5" style={{ fontWeight: 400, fontSize: 42 }}>Plus de services BB Yachts</h2>
        <div className="row justify-content-center">
          {images.map((img, idx) => (
            <div key={idx} className="col-12 col-md-6 d-flex justify-content-center mb-4">
              <div
                style={{
                  background: "#d1d1d1",
                  borderRadius: 16,
                  width: window.innerWidth < 600 ? "95vw" : 400,
                  maxWidth: "100%",
                  height: window.innerWidth < 600 ? 180 : 550,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <img src={img} alt={`Service ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
