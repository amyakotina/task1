import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorModal from '../ui/ErrorModal';
import { clearError } from '../store/slices/settingsSlice';

interface CommonWrapperProps {
  children: React.ReactNode;
}

const CommonWrapper: React.FC<CommonWrapperProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.settings);

  return (
    <>
      {children}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorModal error={error} onClose={() => dispatch(clearError())} />}
    </>
  );
};

export default CommonWrapper;