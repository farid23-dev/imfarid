import { useRef, useState, useEffect } from "react";

/**
 * Drag-and-drop reorder with deferred Save / Cancel.
 * Only the handle is draggable so table scroll works on mobile.
 */
export default function useDragReorder(items, setItems, saveOrder) {
  const dragIndex = useRef(null);
  const overIndex = useRef(null);
  const itemsRef = useRef(items);
  const originalRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  itemsRef.current = items;

  useEffect(() => {
    if (!isDirty) {
      originalRef.current = items.map((item) => ({ ...item }));
    }
  }, [items, isDirty]);

  const getRowProps = (index) => ({
    className: `admin-table__row--sortable${dragging && dragIndex.current === index ? " is-dragging" : ""}`,
    onDragOver: (e) => {
      e.preventDefault();
    },
    onDragEnter: (e) => {
      e.preventDefault();
      overIndex.current = index;
    },
    onDrop: (e) => {
      e.preventDefault();
      overIndex.current = index;
    },
  });

  const getHandleProps = (index) => ({
    draggable: true,
    className: "admin-drag-handle",
    title: "Drag to reorder",
    "aria-label": "Drag to reorder",
    onDragStart: (e) => {
      dragIndex.current = index;
      setDragging(true);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", String(index));
      } catch {
        // ignore
      }
    },
    onDragEnd: () => {
      const from = dragIndex.current;
      const to = overIndex.current;

      dragIndex.current = null;
      overIndex.current = null;
      setDragging(false);

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

  return { getRowProps, getHandleProps, isDirty, isSaving, save, cancel };
}

export function DragHandle(props) {
  return (
    <span {...props}>
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
