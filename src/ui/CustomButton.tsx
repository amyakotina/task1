import React from 'react';

interface CustomButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  icon,
}) => {
  const getVariantClass = () => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      success: 'btn-success',
      outline: 'btn-outline-primary',
    };
    return variants[variant];
  };

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${fullWidth ? 'w-100' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={typeof children === 'string' ? children : 'Кнопка'}
    >
      {icon && <span className="me-2">{icon}</span>}
      {children}
    </button>
  );
};

export default CustomButton;