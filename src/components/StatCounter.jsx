// components/StatCounter.jsx
import { useEffect, useState } from "react";

const StatCounter = ({ end, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 20);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(counter);
  }, [end]);

  return (
    <div className="text-center">
      <h3 className="text-4xl text-green-700 font-bold">{count}</h3>
      <p className="text-gray-600 mt-2">{label}</p>
    </div>
  );
};

export default StatCounter;