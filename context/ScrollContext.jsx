// context/ScrollContext.tsx
import { createContext, useContext, useRef, useState } from "react";

const ScrollContext = createContext({
  isScrolling: false,
  handleScroll: () => {},
});

export const ScrollProvider = ({ children }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const timerRef = useRef(null);

  const handleScroll = () => {
    setIsScrolling(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  return (
    <ScrollContext.Provider value={{ isScrolling, handleScroll }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => useContext(ScrollContext);
