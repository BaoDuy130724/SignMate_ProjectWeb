import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, role }) => {
  return (
    <>
      <Sidebar role={role} />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

export default Layout;
