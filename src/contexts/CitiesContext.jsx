import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";

import { cities_data } from "../../data/cities_data";

const CitiesContext = createContext();

const initialState = {
  cities: JSON.parse(localStorage.getItem("cities")) || [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, cities: action.payload, isLoading: false };
    case "city/loaded":
      return { ...state, currentCity: action.payload, isLoading: false };
    case "city/created":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        isLoading: false,
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        isLoading: false,
      };
    case "rejected":
      return { ...state, error: action.payload };
    default:
      throw new Error("Invalid action provided");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    function fetchCities() {
      if (cities.length === 0)
        dispatch({ type: "cities/loaded", payload: cities_data });
      if (!localStorage.getItem("cities")) {
        localStorage.setItem("cities", JSON.stringify(cities_data));
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    (id) => {
      if (currentCity.id === Number(id)) return;
      dispatch({ type: "loading" });
      const data = cities.filter((city) => city.id === Number(id))[0];
      dispatch({ type: "city/loaded", payload: data });
    },
    [currentCity.id]
  );

  function createCity(newCity) {
    dispatch({ type: "loading" });
    const cities = JSON.parse(localStorage.getItem("cities"));
    const updated_cities = [...cities, newCity];
    localStorage.setItem("cities", JSON.stringify(updated_cities));
    dispatch({ type: "city/created", payload: newCity });
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    const cities = JSON.parse(localStorage.getItem("cities"));
    const updated_cities = cities.filter((city) => city.id !== Number(id));
    localStorage.setItem("cities", JSON.stringify(updated_cities));
    dispatch({ type: "city/deleted", payload: id });
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (!context)
    throw new Error("CitiesContext was used outside the Cities Provider ");
  return context;
}

export { CitiesProvider, useCities };
