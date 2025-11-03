export default function Terms() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <div className='prose prose-lg max-w-none'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Conditions d&apos;utilisation</h1>

        <div className='space-y-6 text-gray-700'>
          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              1. Acceptation des conditions
            </h2>
            <p>
              En accédant et en utilisant la plateforme Finance4All, vous acceptez d&apos;être lié
              par les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces
              conditions, veuillez ne pas utiliser notre plateforme.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              2. Description du service
            </h2>
            <p>
              Finance4All est une plateforme d&apos;inclusion financière qui propose des services de
              formation, de simulation et de comparaison de produits financiers. Notre objectif est
              de vous aider à prendre des décisions financières éclairées.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              3. Compte utilisateur
            </h2>
            <p>
              Pour utiliser certains services de notre plateforme, vous devez créer un compte. Vous
              vous engagez à :
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la sécurité de votre compte et de votre mot de passe</li>
              <li>Notifier immédiatement toute utilisation non autorisée de votre compte</li>
              <li>Être responsable de toutes les activités qui se produisent sous votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              4. Utilisation de la plateforme
            </h2>
            <p>
              Vous vous engagez à utiliser la plateforme uniquement à des fins légales et
              conformément aux présentes conditions. Il est interdit de :
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Utiliser la plateforme de manière frauduleuse ou illégale</li>
              <li>Tenter d&apos;accéder à des zones non autorisées de la plateforme</li>
              <li>Transmettre des virus, malware ou tout code malveillant</li>
              <li>Collecter des informations sur d&apos;autres utilisateurs sans autorisation</li>
              <li>Utiliser des robots ou scripts automatisés pour accéder à la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              5. Propriété intellectuelle
            </h2>
            <p>
              Tous les contenus de la plateforme Finance4All, y compris les textes, graphiques,
              logos, icônes et logiciels, sont la propriété de Finance4All ou de ses fournisseurs de
              contenu et sont protégés par les lois sur la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              6. Limitation de responsabilité
            </h2>
            <p>
              Finance4All fournit la plateforme &quot;en l&apos;état&quot; sans garantie
              d&apos;aucune sorte. Nous ne garantissons pas que la plateforme sera ininterrompue,
              sécurisée ou exempte d&apos;erreurs. Vous utilisez la plateforme à vos propres
              risques.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>
              7. Modification des conditions
            </h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions d&apos;utilisation à tout
              moment. Les modifications prendront effet dès leur publication sur cette page. Il est
              de votre responsabilité de consulter régulièrement ces conditions.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>8. Résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier votre accès à la plateforme à
              tout moment, sans préavis, pour toute violation de ces conditions d&apos;utilisation
              ou pour toute autre raison que nous jugeons appropriée.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mt-8 mb-4'>9. Contact</h2>
            <p>
              Pour toute question concernant ces conditions d&apos;utilisation, vous pouvez nous
              contacter à l&apos;adresse suivante :
            </p>
            <p className='mt-4'>
              <strong>Email :</strong> contact@finance4all.com
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
