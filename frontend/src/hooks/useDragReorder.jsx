import { useRef, useState, useEffect } from "react";

/**
 * Drag-and-drop reorder with deferred Save / Cancel.
 */
export default function useDragReorder(items, setItems, saveOrder) {
  const dragIndex = useRef(null);
  const overIndex = useRef(null);
  const itemsRef = useRef(items);
  const originalRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  itemsRef.current = items;

  // Keep a clean snapshot when not dirty (after load / save / cancel)
  useEffect(() => {
    if (!isDirty) {
      originalRef.current = items.map((item) => ({ ...item }));
    }
  }, [items, isDirty]);

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
    onDragEnd: () => {
      const from = dragIndex.current;
      const to = overIndex.current;

      dragIndex.current = null;
      overIndex.current = null;

      if (from === null || to === null || from === to) return;

      const updated = [...itemsRef.current];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      setItems(updated);
      setIsDirty(true);
    },
  });

  const save = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      await saveOrder(itemsRef.current.map((item) => item.id));
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save order:", error);
      alert(error.message || "Failed to save order");
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    if (originalRef.current) {
      setItems(originalRef.current.map((item) => ({ ...item })));
    }
    setIsDirty(false);
  };

  return { getRowProps, isDirty, isSaving, save, cancel };
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

export function ReorderActions({ isDirty, isSaving, onSave, onCancel }) {
  if (!isDirty) return null;

  return (
    <div className="admin-reorder-bar">
      <span className="admin-reorder-bar__text">Order changed — save to apply on the website</span>
      <div className="admin-reorder-bar__actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
        <button type="button" className="admin-btn admin-btn--primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Order"}
        </button>
      </div>
    </div>
  );
}
