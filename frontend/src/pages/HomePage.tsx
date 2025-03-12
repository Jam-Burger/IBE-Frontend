import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useSelector((state: RootState) => state.data);

  if (loading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error}</p>;

  return (
    <div className="text-1xl font-bold underline">
      
      {/* Student Information */}
      {data.length > 0 && (
       
          <h1>{t("name", { name: data[1]?.name })}</h1>
        
      )}
    </div>
  );
};

export default HomePage;
