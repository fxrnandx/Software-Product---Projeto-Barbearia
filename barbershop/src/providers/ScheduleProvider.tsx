'use client';
import { Employee } from '@/utils/employees';
import { Service } from '@/utils/services';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

interface ScheduleContextType {
  shopId: number;
  selectedServices: Service[];
  setSelectedServices: Dispatch<SetStateAction<Service[]>>;
  selectedWorker: Employee | null;
  setSelectedWorker: Dispatch<SetStateAction<Employee | null>>;
}

const ScheduleContext = createContext<ScheduleContextType>({
  shopId: 0,
  selectedServices: [],
  selectedWorker: null,
  setSelectedWorker: () => {
  },
  setSelectedServices: () => { 

  }});

export function ScheduleProvider({
  children,
  shopId
}: Readonly<{
  children: React.ReactNode;
  shopId: number;
}>) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Employee | null>(null);

  return (
    <ScheduleContext.Provider value={{ selectedServices, setSelectedServices, selectedWorker, setSelectedWorker, shopId }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);