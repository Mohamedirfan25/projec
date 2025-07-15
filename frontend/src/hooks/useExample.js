// Example custom hook
import { useState } from 'react';

export function useExample() {
  const [value, setValue] = useState(null);
  return [value, setValue];
}
