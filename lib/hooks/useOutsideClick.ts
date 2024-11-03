import { useEffect, useRef } from 'react';

type UseOutsideClickProps = {
  onOutsideClick: () => void;
};

const useOutsideClick = ({ onOutsideClick }: UseOutsideClickProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onOutsideClick]);

  return ref;
};

export default useOutsideClick;
