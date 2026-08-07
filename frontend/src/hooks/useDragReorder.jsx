import { useRef } from "react";

/**
 * Shared drag-and-drop reorder helpers for admin tables.
 * Returns row props to spread onto <tr>.
 */
export default function useDragReorder(items, setItems, saveOrder) {
  const dragIndex = useRef(null);
  const overIndex = useRef(null);
  const itemsRef = useRef(items);
  const saveOrderRef = useRef(saveOrder);

  itemsRef.current = items;
  saveOrderRef.current = saveOrder;

  const getRowProps = (index) => ({
    draggable: true,
    className: "admin-table__row--sortable",
    onDragStart: () => {
      dragIndex.current = index;
    },
    onDragEnter: (e) => {
      e.preventDefault();
      overIndex.current = index;
    },
    onDragOver: (e) => {
      e.preventDefault();
    },
    onDragEnd: async () => {
      const from = dragIndex.current;
      const to = overIndex.current;

      dragIndex.current = null;
      overIndex.current = null;

      if (from === null || to === null || from === to) return;

      const updated = [...itemsRef.current];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      setItems(updated);

      try {
        await saveOrderRef.current(updated.map((item) => item.id));
      } catch (error) {
        console.error("Failed to save order:", error);
      }
    },
  });

  return { getRowProps };
}

export function DragHandle() {
  return (
    <span className="admin-drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </span>
  );
}
