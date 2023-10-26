"use client";

import { mergeClasses } from "@coaster/utils/common";
import { memo } from "react";
import { useDrag, useDrop } from "react-dnd";

interface Item {
  id: string;
  originalIndex: number;
}

interface CardProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  moveCard: (id: string, atIndex: number) => void;
  findCard: (id: string) => { image: any; index: number };
  onDrop: () => void;
}

export const Card: React.FC<CardProps> = memo(({ id, className, children, moveCard, findCard, onDrop }) => {
  const originalIndex = findCard(id).index;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "card",
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveCard(droppedId, originalIndex);
        } else {
          onDrop();
        }
      },
    }),
    [id, originalIndex, moveCard],
  );

  const [, drop] = useDrop(
    () => ({
      accept: "card",
      hover({ id: draggedId }: Item) {
        if (draggedId !== id) {
          const { index: overIndex } = findCard(id);
          moveCard(draggedId, overIndex);
        }
      },
    }),
    [findCard, moveCard],
  );

  const opacity = isDragging ? 0 : 1;
  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity }} className={mergeClasses(className)}>
      {children}
    </div>
  );
});
