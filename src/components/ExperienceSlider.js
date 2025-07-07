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

	return (
		<div style={{ 
			maxWidth: 1240, 
			margin: "0 auto", 
			padding: window.innerWidth < 768 ? "0 16px" : "0 20px" 
		}}>
			<Slider {...settings}>
				{experiences.map((exp, idx) => (
					<div key={idx} style={{
						padding: window.innerWidth < 768 ? "0 8px" : "0 12px"
					}}>
						<div
							style={{
								position: "relative",
								background: `url(${exp.image}) center/cover no-repeat`,
								borderRadius: window.innerWidth < 768 ? 16 : 24,
								boxShadow: window.innerWidth < 768 ? "0 8px 32px rgba(0,0,0,0.15)" : "0 4px 24px rgba(0,0,0,0.07)",
								overflow: "hidden",
								height: window.innerWidth < 768 ? 240 : 300,
								width: "100%",
								margin: "0 auto",
								border: window.innerWidth < 768 ? "1px solid #e1e5e9" : "none",
								transition: "all 0.3s ease"
							}}
							onMouseEnter={(e) => {
								if (window.innerWidth >= 768) {
									e.currentTarget.style.transform = "translateY(-4px)";
									e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
								}
							}}
							onMouseLeave={(e) => {
								if (window.innerWidth >= 768) {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)";
								}
							}}
						>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									background: window.innerWidth < 768 ? 
										"linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" : 
										"rgba(0,0,0,0.35)",
									zIndex: 1,
								}}
							/>
							<div
								style={{
									position: "relative",
									zIndex: 2,
									color: "#fff",
									width: "100%",
									padding: window.innerWidth < 768 ? "20px 20px 24px 20px" : "28px 24px 18px 24px",
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-start",
									justifyContent: window.innerWidth < 768 ? "flex-end" : "flex-start",
									height: "100%",
								}}
							>
								<h5 className="mb-2" style={{ 
									fontWeight: 700,
									fontSize: window.innerWidth < 768 ? 18 : 20,
									textShadow: "0 2px 8px rgba(0,0,0,0.5)",
									letterSpacing: window.innerWidth < 768 ? "-0.3px" : "-0.5px"
								}}>
									{exp.titre}
								</h5>
								<p
									className="mb-0"
									style={{
										fontSize: window.innerWidth < 768 ? 14 : 15,
										textShadow: "0 2px 8px rgba(0,0,0,0.5)",
										lineHeight: window.innerWidth < 768 ? 1.4 : 1.5,
										opacity: 0.95
									}}
								>
									{exp.description}
								</p>
							</div>
						</div>
					</div>
				))}
			</Slider>
			
			{/* Styles personnalisés pour les dots sur mobile */}
			<style jsx>{`
				@media (max-width: 767px) {
					.slick-dots {
						bottom: -40px !important;
					}
					
					.slick-dots li button:before {
						font-size: 12px !important;
						color: #0066cc !important;
						opacity: 0.5 !important;
					}
					
					.slick-dots li.slick-active button:before {
						opacity: 1 !important;
						color: #2c3e50 !important;
					}
				}
				
				.slick-prev:before, .slick-next:before {
					font-size: 24px !important;
					color: #2c3e50 !important;
				}
				
				.slick-prev {
					left: -40px !important;
				}
				
				.slick-next {
					right: -40px !important;
				}
			`}</style>
		</div>
	);
}
