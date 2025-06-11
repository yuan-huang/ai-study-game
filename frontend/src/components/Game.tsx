import React, { useState, useEffect } from 'react';
import { SpiritDialog } from './SpiritDialog';

interface SpiritClickEvent extends CustomEvent {}

export const Game: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [spiritPosition, setSpiritPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {


    window.addEventListener('spiritClick', (event: Event) => {
      const customEvent = event as SpiritClickEvent;
      console.log('Game组件收到spiritClick事件', customEvent.detail);
      setIsDialogOpen(true);
    });


  }, []);

  return (
    <>
      <SpiritDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}; 