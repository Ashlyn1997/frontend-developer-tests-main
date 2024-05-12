// App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { User, FilterGender } from './types';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<FilterGender>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/?results=100');
      const data = await response.json();
      const usersWithRegisteredDate = data.results.map((user: User) => ({
        ...user,
        registeredDate: new Date(user.registered.date),
      }));
      setUsers(usersWithRegisteredDate);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sortUsersByCountry = (): [string, User[]][] => {
    const usersByCountry: { [key: string]: User[] } = {};
    users.forEach((user) => {
      const { country } = user.location;
      if (!usersByCountry[country]) {
        usersByCountry[country] = [];
      }
      usersByCountry[country].push(user);
    });
    return Object.entries(usersByCountry).sort((a, b) => b[1].length - a[1].length);
  };

  const handleCountryClick = (country: string) => {
    setExpandedCountry(country === expandedCountry ? null : country);
  };

  const filteredUsers = (users: User[]): User[] => {
    return users
      .sort((a, b) => b.registeredDate.getTime() - a.registeredDate.getTime())
      .filter((user) => {
        if (filterGender === 'all') return true;
        return user.gender === filterGender;
      });
  };

  const renderUserList = (countryUsers: User[]) => {
    const filteredUsersList = filteredUsers(countryUsers)
    if(filteredUsersList.length) {
      return filteredUsersList.map((user) => (
        <div key={user.login.uuid} className="user-card">
          <img src={user.picture.thumbnail} alt={user.name.first} />
          <div className="user-info">
            <h3>{user.name.first} {user.name.last}</h3>
            <p>Gender: {user.gender}</p>
            <p>City: {user.location.city}</p>
            <p>State: {user.location.state}</p>
            <p>Registered: {user.registeredDate.toLocaleDateString()}</p>
          </div>
        </div>
      ))
    }else {
      return (
        <div className='empty'>No data</div>
      )
    }
  }

  return (
    <div className="App">
      <h1>Country User List</h1>
      <div className="filter-container">
        <label htmlFor="gender-filter">Filter by Gender:</label>
        <select
          id="gender-filter"
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value as FilterGender)}
        >
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="country-list">
        {sortUsersByCountry().map(([country, countryUsers]) => (
          <div
            key={country}
            className={`country-item ${expandedCountry === country ? 'expanded' : ''}`}
            onClick={() => handleCountryClick(country)}
          >
            <h2>{country} (total: {countryUsers.length})</h2>
            {expandedCountry === country && (
              <div className="user-list">
                {renderUserList(countryUsers)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
