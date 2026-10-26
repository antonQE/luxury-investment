import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Top progress cue when the admin route changes. */
export function RouteProgress() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const first = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    setVisible(true);
    setWidth(35);
    const mid = setTimeout(() => {
      setWidth(78);
    }, 80);
    const done = setTimeout(() => {
      setWidth(100);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 220);
    }, 260);
    return () => {
      clearTimeout(mid);
      clearTimeout(done);
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    };
  }, [location.pathname, location.search]);

  if (!visible && width === 0) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      h="2px"
      zIndex={200}
      pointerEvents="none"
      data-testid="admin-route-progress"
    >
      <Box
        h="100%"
        bg="accent.gold"
        style={{
          width: `${String(width)}%`,
          opacity: visible ? 1 : 0,
          transition: 'width 0.2s ease-out, opacity 0.2s ease',
          boxShadow: '0 0 10px rgba(166, 132, 69, 0.5)',
        }}
      />
    </Box>
  );
}
