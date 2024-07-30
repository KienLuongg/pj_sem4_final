
import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import teacherApi from '../../apis/urlApi';

import { getLocalStorageItem, setLocalStorageItem } from '../../utils/storage/local-storage';
import { Storage } from '../../contstants/storage';
import { getCookie } from '../../utils/storage//cookie-storage';

export type YearContextType = {
  idYear: number | null;
  setIdYear: (year: number | null) => void;
  schoolYears: any[]; 
};

export const YearContext = createContext<YearContextType>({
  idYear: null,
  setIdYear: () => { },
  schoolYears: [],
});

interface Props {
  children: ReactNode;
}

const YearProvider: React.FC<Props> = ({ children }) => {
  const [idYear, setIdYear] = useState<any>(() => {
    const storedYear = getLocalStorageItem(Storage.idYear);

    return storedYear ? parseInt(storedYear, 10) : '';
  });
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const token = getCookie('token')
  useEffect(() => {
    if(!token) return;
    const fetchData = async (id: number) => {
      try {
        const res = await teacherApi.getSchoolYear();
        console.log(res);
        setSchoolYears(res?.data);
        const defaultOption = res?.data.find((year: any) => year.id === id);
        if (defaultOption) {
          setIdYear(defaultOption.id);
        }
        setLocalStorageItem(Storage.idYear, JSON?.stringify(defaultOption.id))
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData(idYear);
  }, [idYear]);
  const value = useMemo(
    () => ({
      idYear,
      setIdYear,
      schoolYears,
    }),
    [idYear, schoolYears]
  );

  return <YearContext.Provider value={value}>{children}</YearContext.Provider>;
};

export default YearProvider;
