import UsersList from '@/components/users/UsersList';
import UserStatsCards from '@/components/users/UserStatsCards';

const UsersPage = () => {
  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <UserStatsCards />
        <UsersList />
      </div>
    </div>
  );
};

export default UsersPage;
