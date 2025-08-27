const  PublicFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Finance4All</h3>
            <p className="text-gray-400 text-sm">
              Votre partenaire pour une meilleure gestion financière.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/comparator">Comparator</a></li>
              <li><a href="/formations">Formation</a></li>
              <li><a href="/conseil">Conseil</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/help">Aide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">
              📞 +221 77 123 45 67
              <br />
              📧 contact@finance4all.sn
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Finance4All. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter;