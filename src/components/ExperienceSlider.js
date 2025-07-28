import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function ExperienceSlider() {
	const [experiences, setExperiences] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchExperiences = async () => {
			try {
				const ref = collection(db, "experience");
				const snap = await getDocs(ref);
				console.log("=== DEBUG Firestore ===");
				console.log("Nombre de documents :", snap.size);
				snap.docs.forEach((doc, i) => {
					console.log(`DOC #${i} - id: ${doc.id}`, doc.data());
				});
				const data = snap.docs
					.filter(doc => doc.exists())
					.map(doc => {
						const d = doc.data();
						console.log("Mapping doc:", doc.id, d); // Affiche chaque doc mappé
						return {
							id: doc.id,
							...d,
							image: d.image && d.image.trim() !== "" ? d.image : "/default-experience.jpg"
						};
					});
				console.log("=== Expériences finales à afficher ===", data);
				setExperiences(data);
			} catch (e) {
				console.error("Erreur lors du chargement des expériences :", e);
				setExperiences([]);
			}
			setLoading(false);
		};
		fetchExperiences();
	}, []);

	const navigate = (url) => { window.location.href = url; };

	const settings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: window.innerWidth < 768 ? 1 : 2,
		slidesToScroll: 1,
		arrows: window.innerWidth >= 768,
		autoplay: window.innerWidth < 768,
		autoplaySpeed: 4000,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
					arrows: true,
					dots: true,
				},
			},
			{
				breakpoint: 768,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					dots: true,
					autoplay: true,
					autoplaySpeed: 4000,
				},
			},
		],
	};

	if (loading) {
		return <div style={{ textAlign: "center", color: "#232323", fontWeight: 600, fontSize: 18, padding: 32 }}>Chargement des expériences...</div>;
	}

	if (!experiences.length) {
		return <div style={{ textAlign: "center", color: "#888", fontWeight: 500, fontSize: 16, padding: 32 }}>Aucune expérience disponible.</div>;
	}

	// Affiche toutes les expériences en row (plus de restriction à une seule)
	const toDisplay = experiences;

	return (
		<div style={{
			maxWidth: 1240,
			margin: "0 auto",
			padding: window.innerWidth < 768 ? "0 8px" : "0 20px"
		}}>
			<h2 style={{
				fontWeight: 800,
				fontSize: window.innerWidth < 768 ? 22 : 32,
				color: "#2c3e50",
				letterSpacing: -0.5,
				marginBottom: 32,
				textAlign: "center",
				textShadow: "0 2px 8px #23232311"
			}}>
				Nos expériences à vivre
			</h2>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					gap: window.innerWidth < 768 ? 16 : 32,
					overflowX: "auto",
					paddingBottom: 24,
					justifyContent: window.innerWidth < 768 ? "flex-start" : "center",
					scrollSnapType: window.innerWidth < 768 ? "x mandatory" : undefined,
					WebkitOverflowScrolling: "touch"
				}}
			>
				{toDisplay.map((exp) => (
					<div
						key={exp.id}
						style={{
							minWidth: window.innerWidth < 768 ? 260 : 340,
							maxWidth: 400,
							flex: "1 0 320px",
							padding: 0,
							background: "#fff",
							borderRadius: 24,
							boxShadow: "0 6px 32px #0001",
							border: "1.5px solid #e5e7eb",
							overflow: "hidden",
							transition: "box-shadow 0.2s, transform 0.2s",
							cursor: "pointer",
							position: "relative",
							scrollSnapAlign: window.innerWidth < 768 ? "start" : undefined
						}}
						onClick={e => {
							e.stopPropagation();
							window.location.href = `/experiencepage/${exp.id}`;
						}}
						tabIndex={0}
						role="button"
						onKeyDown={e => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
								window.location.href = `/experiencepage/${exp.id}`;
							}
						}}
					>
						<div style={{
							width: "100%",
							height: window.innerWidth < 768 ? 160 : 200,
							background: `url(${exp.image}) center/cover no-repeat`,
							borderTopLeftRadius: 24,
							borderTopRightRadius: 24,
							position: "relative"
						}}>
							<div style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
								background: window.innerWidth < 768
									? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)"
									: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.35) 100%)",
								zIndex: 1,
								borderTopLeftRadius: 24,
								borderTopRightRadius: 24
							}} />
						</div>
						<div style={{
							padding: window.innerWidth < 768 ? "18px 16px 22px 16px" : "28px 24px 24px 24px",
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-start",
							justifyContent: "flex-start",
							height: "auto",
							background: "#fff"
						}}>
							<h5 style={{
								fontWeight: 800,
								fontSize: window.innerWidth < 768 ? 18 : 22,
								color: "#232323",
								marginBottom: 12,
								letterSpacing: -0.5,
								textShadow: "0 2px 8px #23232311"
							}}>
								{exp.nom || exp.titre}
							</h5>
							<p style={{
								fontSize: window.innerWidth < 768 ? 14 : 16,
								color: "#555",
								lineHeight: 1.6,
								marginBottom: 0,
								fontWeight: 500,
								opacity: 0.95
							}}>
								{exp.description}
							</p>
						</div>
						{/* Bulle expérience supprimée */}
					</div>
				))}
			</div>
			{/* Styles personnalisés pour le scroll horizontal */}
			<style>{`
				@media (max-width: 767px) {
					::-webkit-scrollbar {
						height: 8px;
						background: #f2f2f2;
					}
					::-webkit-scrollbar-thumb {
						background: #e5e7eb;
						border-radius: 8px;
					}
					/* Améliore le scroll horizontal sur mobile */
					[data-experience-row] {
						-webkit-overflow-scrolling: touch;
						scroll-snap-type: x mandatory;
					}
					[data-experience-card] {
						scroll-snap-align: start;
					}
				}
			`}</style>
		</div>
	);
}
