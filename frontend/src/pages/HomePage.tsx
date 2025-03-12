import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Student } from '../redux/dataSlice';


const HomePage: React.FC = () => {
  const { t } = useTranslation("student");
  const { data, loading, error } = useSelector((state: RootState) => state.data);

  if (loading) return <p>{t('loading')}</p>;
  if (error) return <p>{t('error')}: {error}</p>;
  console.log(data);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((student:Student, index:number) => (
          <div
            key={ student?.email ?? index}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{student?.name}</h2>
              <div className="text-gray-700">
                <p className="mb-1">
                  <span className="font-medium">{t('age', { age: student?.age })}</span>
                </p>
                <p className="mb-1">
                  <span className="font-medium">{t('email', { email: student?.email })}</span>
                </p>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default HomePage;