export default function Privacy() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12 mt-[5%]'>
      <div className='prose prose-lg max-w-none'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Politique de confidentialité</h1>

        <div className='space-y-6 text-gray-700'>
          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              1. Collecte des informations
            </h2>
            <p>
              Finance4All collecte des informations personnelles lorsque vous créez un compte,
              utilisez nos services ou interagissez avec notre plateforme. Les informations
              collectées peuvent inclure votre nom, adresse email, numéro de téléphone et autres
              données nécessaires à la fourniture de nos services.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              2. Utilisation des informations
            </h2>
            <p>Nous utilisons vos informations personnelles pour :</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Fournir et améliorer nos services</li>
              <li>Vous contacter concernant votre compte ou nos services</li>
              <li>Vous envoyer des notifications importantes</li>
              <li>Personnaliser votre expérience sur la plateforme</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              3. Protection des données
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
              appropriées pour protéger vos informations personnelles contre tout accès non
              autorisé, perte, destruction ou altération.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              4. Partage des informations
            </h2>
            <p>
              Nous ne vendons, n&apos;échangeons ni ne louons vos informations personnelles à des
              tiers. Nous pouvons partager vos informations uniquement dans les cas suivants :
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Avec votre consentement explicite</li>
              <li>Pour se conformer à une obligation légale</li>
              <li>Pour protéger nos droits et notre sécurité</li>
              <li>
                Avec des prestataires de services de confiance qui nous aident à exploiter notre
                plateforme
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>5. Vos droits</h2>
            <p>Vous avez le droit de :</p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Accéder à vos informations personnelles</li>
              <li>Corriger ou mettre à jour vos informations</li>
              <li>Demander la suppression de vos données</li>
              <li>Vous opposer au traitement de vos données</li>
              <li>Demander la portabilité de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>6. Cookies</h2>
            <p>
              Notre plateforme utilise des cookies pour améliorer votre expérience de navigation.
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut
              affecter certaines fonctionnalités de notre site.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>7. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout
              moment. Les modifications seront publiées sur cette page avec une date de mise à jour.
              Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos
              pratiques.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>8. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données
              personnelles, vous pouvez nous contacter à l&apos;adresse suivante :
            </p>
            <p className='mt-4'>
              <strong>Email :</strong> privacy@finance4all.com
            </p>
          </section>

          <section className='mt-8 pt-8 border-t border-gray-200'>
            <p className='text-sm text-gray-500'>
              Dernière mise à jour :{' '}
              {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
