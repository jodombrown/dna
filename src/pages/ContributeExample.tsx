
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ContributeExample = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the enhanced contribute page
    navigate('/contribute-enhanced', { replace: true });
  }, [navigate]);

  return null;
};

export default ContributeExample;
