import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Experience() {
	const { id } = useParams();
	const [experience, setExperience] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchExperience = async () => {
			try {
				const ref = doc(db, "experience", id);
				const snap = await getDoc(ref);
				if (snap.exists()) {
					setExperience({ id: snap.id, ...snap.data() });
				} else {
					setExperience(null);
				}
			} catch (e) {
				setExperience(null);
			}
			setLoading(false);
		};
		fetchExperience();
	}, [id]);

	if (loading) {
		return <div style={{ textAlign: "center", color: "#232323", fontWeight: 600, fontSize: 20, padding: 48 }}>Chargement de l'expérience...</div>;
	}

	if (!experience) {
		return <div style={{ textAlign: "center", color: "#888", fontWeight: 500, fontSize: 18, padding: 48 }}>Expérience introuvable.</div>;
	}

	return (
		<div style={{
			maxWidth: 900,
			margin: "40px auto",
			padding: window.innerWidth < 768 ? "0 8px" : "0 32px",
			background: "#fff",
			borderRadius: 28,
			boxShadow: "0 8px 32px #23232311",
			display: "flex",
			flexDirection: window.innerWidth < 900 ? "column" : "row",
			gap: 0,
			overflow: "hidden"
		}}>
			<div style={{
				flex: 1,
				minWidth: 320,
				background: `url(${experience.image && experience.image.trim() !== "" ? experience.image : "/default-experience.jpg"}) center/cover no-repeat`,
				minHeight: 320,
				maxHeight: 420,
				borderTopLeftRadius: 28,
				borderBottomLeftRadius: window.innerWidth < 900 ? 0 : 28,
				borderTopRightRadius: window.innerWidth < 900 ? 28 : 0,
				transition: "background 0.2s"
			}} />
			<div style={{
				flex: 2,
				padding: window.innerWidth < 900 ? "28px 18px 24px 18px" : "48px 36px 36px 36px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "flex-start",
				background: "#fff"
			}}>
				<h1 style={{
					fontWeight: 900,
					fontSize: window.innerWidth < 768 ? 24 : 32,
					color: "#1a237e",
					marginBottom: 18,
					letterSpacing: -0.5,
					textShadow: "0 2px 8px #23232311"
				}}>
					{experience.nom || experience.titre}
				</h1>
				<p style={{
					fontSize: window.innerWidth < 768 ? 15 : 18,
					color: "#444",
					lineHeight: 1.7,
					marginBottom: 0,
					fontWeight: 500,
					opacity: 0.97
				}}>
					{experience.description}
				</p>
			</div>
		</div>
	);
}
