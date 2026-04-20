import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light text-center text-lg-start mt-auto">
      <div className="text-center p-3" style={{ backgroundColor: '#f5f5f5' }}>
        © {new Date().getFullYear()} TaskManager. Все права защищены.
      </div>
    </footer>
  );
};

export default Footer;