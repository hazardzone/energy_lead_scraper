import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      {/* Background Gradient */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-600 to-yellow-400 opacity-20"
        style={{ zIndex: -1 }}
      ></div>

      {/* Main Content */}
      <div className="bg-yellow-50 p-8 rounded-lg shadow-lg text-center max-w-lg">
        <h1 className="text-4xl font-bold text-black mb-4">
          Bienvenue dans le Gestionnaire de Leads Énergie
        </h1>
        <p className="text-gray-700 mb-8">
          Gérez et suivez les prospects pour les programmes de subventions énergétiques en France.
        </p>

        {/* Key Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Pourquoi choisir notre plateforme ?</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Interface utilisateur intuitive et conviviale.</li>
            <li>Gestion simplifiée des leads grâce à des outils puissants.</li>
            <li>Suivi en temps réel du statut des prospects.</li>
            <li>Intégration avec des sources de données externes (ex. : Pages Jaunes).</li>
            <li>Personnalisation complète pour s'adapter à vos besoins spécifiques.</li>
          </ul>
        </div>

        {/* Call to Action Button */}
        <Link
          href="/dashboard"
          className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300 font-semibold shadow-md"
        >
          Accéder au Tableau de Bord
        </Link>
      </div>

      {/* Footer Information */}
      <footer className="mt-8 text-center text-gray-500">
        <p>&copy; 2025 HazardZone. Tous droits réservés.</p>
        <p>Conçu avec ❤️ par votre équipe dédiée.</p>
      </footer>
    </div>
  );
}