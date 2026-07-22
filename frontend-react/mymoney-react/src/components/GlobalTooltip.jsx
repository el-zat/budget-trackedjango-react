import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/GlobalTooltip.scss';

const GlobalTooltip = () => {
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0, colorClass: '' });
  const [adjustedPos, setAdjustedPos] = useState({ left: 0, arrowOffset: 0 });
  const tooltipRef = useRef(null);
  const hideTimeout = useRef(null);

  const getColorClass = (el) => {
    if (el.closest('.edit-btn')) return 'tooltip-edit';
    if (el.closest('.delete-btn')) return 'tooltip-delete';
    if (el.closest('.recurring-btn')) return 'tooltip-recurring';
    if (el.closest('.copy-btn')) return 'tooltip-copy';
    if (el.closest('.attach-btn.has-receipt')) return 'tooltip-attach-has';
    if (el.closest('.attach-btn')) return 'tooltip-attach';
    return '';
  };

  const handleMouseEnter = useCallback((e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;

    // Only portal-ify tooltips inside scroll wrappers
    if (!target.closest('.table-scroll-wrapper')) return;

    clearTimeout(hideTimeout.current);
    const text = target.getAttribute('data-tooltip');
    if (!text) return;

    const rect = target.getBoundingClientRect();
    const colorClass = getColorClass(target);

    setTooltip({
      visible: true,
      text,
      x: rect.left + rect.width / 2,
      y: rect.top,
      colorClass,
    });
  }, []);

  const handleMouseLeave = useCallback((e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    if (!target.closest('.table-scroll-wrapper')) return;

    hideTimeout.current = setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 50);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      clearTimeout(hideTimeout.current);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  // Adjust position to keep tooltip within viewport
  useEffect(() => {
    if (!tooltip.visible || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();
    const padding = 8;
    const vw = window.innerWidth;

    let left = tooltip.x;
    let arrowOffset = 0;

    // Check right overflow
    if (left + rect.width / 2 > vw - padding) {
      const newLeft = vw - padding - rect.width / 2;
      arrowOffset = left - newLeft;
      left = newLeft;
    }
    // Check left overflow
    if (left - rect.width / 2 < padding) {
      const newLeft = padding + rect.width / 2;
      arrowOffset = left - newLeft;
      left = newLeft;
    }

    setAdjustedPos({ left, arrowOffset });
  }, [tooltip.visible, tooltip.x, tooltip.text]);

  if (!tooltip.visible) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={`global-tooltip ${tooltip.colorClass}`}
      style={{
        left: `${adjustedPos.left}px`,
        top: `${tooltip.y}px`,
      }}
    >
      {tooltip.text}
      <div
        className="global-tooltip-arrow"
        style={adjustedPos.arrowOffset ? { left: `calc(50% + ${adjustedPos.arrowOffset}px)` } : undefined}
      />
    </div>,
    document.body
  );
};

export default GlobalTooltip;
