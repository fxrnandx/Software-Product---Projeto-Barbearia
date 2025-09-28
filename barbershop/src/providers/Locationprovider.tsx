'use client';
import React from 'react';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

interface LocationContextType {
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  state?: string;
  city?: string;
  setLatitude: Dispatch<SetStateAction<number | undefined>>;
  setLongitude: Dispatch<SetStateAction<number | undefined>>;
  setZipCode: Dispatch<SetStateAction<string | undefined>>;
}

const LocationContext = createContext<LocationContextType>({
  latitude: undefined,
  longitude: undefined,
  zipCode: undefined,
  state: undefined,
  setLatitude: () => {},
  setLongitude: () => {},
  setZipCode: () => {},
});

let locationData: {
  latitude?: number,
  longitude?: number,
  city?: string,
  state?: string
}

export const getLocation = () => {
  return locationData;
}

export function setLocation(data: { latitude?: number, longitude?: number, city?: string, state?: string }) {
  locationData = data;
}

export function LocationProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [zipCode, setZipCode] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (zipCode?.length === 8) {
      fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (data.uf) {
            setState(data.uf);
          }
          if (data.localidade) {
            setCity(data.localidade);
          }
        })
        .catch((error) => {
          console.error("Error fetching city:", error);
        });
    }
  }, [zipCode]);

  React.useEffect(() => {
      locationData = { latitude, longitude, state, city };
  }, [latitude, longitude, state, city]);

  return (
    <LocationContext.Provider value={{ latitude, longitude, zipCode, state, city, setLatitude, setLongitude, setZipCode }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);