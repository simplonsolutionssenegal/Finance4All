// frontend/components/admin/UserStats.jsx
const UserStats = ({ users }) => {
  const stats = {
    total: users.length,
    active: users.filter(user => user.status === 'active').length,
    pending: users.filter(user => user.status === 'pending').length,
    inactive: users.filter(user => user.status === 'inactive').length,
  };

  // Calculer les pourcentages pour chaque stat
  const activePercentage = users.length > 0 ? Math.round((stats.active / users.length) * 100) : 0;
  const pendingPercentage = users.length > 0 ? Math.round((stats.pending / users.length) * 100) : 0;
  // const inactivePercentage = users.length > 0 ? Math.round((stats.inactive / users.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-6">
      {/* Carte Total utilisateurs */}
      <div className="bg-white rounded-lg shadow-md-xl p-2 p-6 border-b-4" style={{ borderTopColor: '#6CB9C6' }}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col w-full">
            <div className="flex items-center mb-2">
              <span className="mr-2">
                <svg className="w-6 h-6" fill="none" stroke="#6CB9C6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold" style={{ color: '#6CB9C6' }}>Total Utilisateurs</h3>
              
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold" style={{ color: '#000000' }}>{stats.total}</span>
              
            </div>
            <div className="flex items-baseline">
              <span className="ml-2 text-sm font-medium flex items-center" style={{ color: '#6CB9C6' }}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#6CB9C6' }}>
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {activePercentage}% Actifs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte Utilisateurs actifs */}
      <div className="bg-white rounded-lg shadow-md-xl p-2 p-6 border-b-4" style={{ borderTopColor: '#6CB9C6' }}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col w-full">
            <div className="flex items-center mb-2">
              <span className="mr-2">
                <svg className="w-6 h-6" fill="none" stroke="#6CB9C6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold" style={{ color: '#6CB9C6' }}>Utilisateurs Actifs</h3>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold" style={{ color: '#000000' }}>{stats.active}</span>
      
            </div>
            <div className="flex items-baseline">
              <span className="ml-2 text-sm font-medium flex items-center" style={{ color: '#6CB9C6' }}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#6CB9C6' }}>
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +12%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte En attente */}
      <div className="bg-white rounded-lg shadow-md-xl p-2 p-6 border-b-4" style={{ borderTopColor: '#6CB9C6' }}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col w-full">
            <div className="flex items-center mb-2">
              <span className="mr-2">
                <svg className="w-6 h-6 rotate-180" fill="none" stroke="#6CB9C6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold" style={{ color: '#6CB9C6' }}> Utilisateurs Attente</h3>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold" style={{ color: '#000000' }}>{stats.pending}</span>
            </div>
            <div className="flex items-baseline">
              <span className="ml-2 text-sm font-medium flex items-center" style={{ color: '#6CB9C6' }}>
                <svg className="w-4 h-4 mr-1 rotate-180" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#6CB9C6' }}>
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {pendingPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;