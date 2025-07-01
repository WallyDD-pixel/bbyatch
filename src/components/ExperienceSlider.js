import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const experiences = [
	{
		titre: "Croisière de luxe",
		image: "/7TDkCJ1TfUayTCtsXxDcrKszVXM.avif",
		description:
			"Profitez d'une croisière inoubliable sur la Côte d'Azur à bord d'un yacht moderne.",
	},
	{
		titre: "Sortie pêche",
		image: "/Capture d’écran 2025-06-24 173447.png",
		description:
			"Vivez une expérience authentique de pêche en mer avec un skipper professionnel.",
	},
	{
		titre: "Balade au coucher du soleil",
		image: "/Capture d’écran 2025-06-24 181939.png",
		description:
			"Admirez le coucher du soleil depuis le pont d'un bateau confortable.",
	},
	{
		titre: "Journée en famille",
		image: "/Capture d’écran 2025-06-24 182401.png",
		description:
			"Partagez des moments uniques en famille sur l'eau, en toute sécurité.",
	},
];

export default function ExperienceSlider() {
	const settings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 2,
		slidesToScroll: 1,
		arrows: true,
		responsive: [
			{
				breakpoint: 900,
				settings: {
					slidesToShow: 1,
				},
			},
		],
	};

	return (
		<div style={{ maxWidth: 1240, margin: "0 auto", padding: window.innerWidth < 600 ? "0 10px" : 0 }}>
			<Slider {...settings}>
				{experiences.map((exp, idx) => (
					<div key={idx}>
						<div
							style={{
								position: "relative",
								background: `url(${exp.image}) center/cover no-repeat`,
								borderRadius: 24,
								boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
								overflow: "hidden",
								height: window.innerWidth < 600 ? 180 : 300,
								width: window.innerWidth < 600 ? "90vw" : 590,
								margin: window.innerWidth < 600 ? "0 auto" : "0 12px",
								maxWidth: "100%"
							}}
						>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									background: "rgba(0,0,0,0.35)",
									zIndex: 1,
								}}
							/>
							<div
								style={{
									position: "relative",
									zIndex: 2,
									color: "#fff",
									width: "100%",
									padding: "28px 24px 18px 24px",
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-start",
									justifyContent: "flex-start",
								}}
							>
								<h5 className="mb-2" style={{ fontWeight: 700 }}>
									{exp.titre}
								</h5>
								<p
									className="mb-0"
									style={{
										fontSize: 15,
										textShadow: "0 2px 8px rgba(0,0,0,0.25)",
									}}
								>
									{exp.description}
								</p>
							</div>
						</div>
					</div>
				))}
			</Slider>
		</div>
	);
}
