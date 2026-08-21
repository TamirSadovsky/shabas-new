
import React from 'react';
import {useDroppable} from '@dnd-kit/core';

export function Droppable(props) {
  const {isOver ,setNodeRef} = useDroppable({
    id: props.id,
    disabled: props.submitted,
  });
  const style = {
    opacity: isOver ? 1 : 1,
    // opacity: isActive ? 1 : 0,
    // marginRight:'20px'
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
  