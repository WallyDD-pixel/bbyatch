import React from 'react';
import { useParams } from 'react-router-dom';

const ExperiencePage = () => {
    const { experienceId } = useParams();

    // TODO: Fetch experience details using experienceId

    return (
        <div>
            <h1>Expérience {experienceId}</h1>
            {/* Affichez ici les détails de l'expérience */}
            <p>Bienvenue sur la page de l'expérience sélectionnée.</p>
        </div>
    );
};

export default ExperiencePage;