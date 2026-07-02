import React, { useState } from 'react'
import Icon from './Icon'
import { buildTree, STATUS } from '../data/twinModel'

const tree = buildTree()

function TreeNode({ node, depth, selectedId, hoveredId, onSelect, onHover }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id
  const isHovered = hoveredId === node.id
  const st = STATUS[node.status] || STATUS.ok
  const isGroup = node.kind === 'group'

  return (
    <div>
      <div
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => !isGroup && onSelect(node.id)}
        className={`group flex items-center gap-2 py-1.5 pr-2 rounded-lg transition-colors select-none ${
          isGroup ? 'cursor-default' : 'cursor-pointer'
        } ${
          isSelected
            ? 'bg-primary-container/15 shadow-[inset_0_0_0_1px_rgba(0,242,255,0.4)]'
            : isHovered
            ? 'bg-surface-variant/40'
            : 'hover:bg-surface-variant/25'
        }`}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
            className="text-on-surface-variant hover:text-primary-container -ml-1"
          >
            <Icon name={open ? 'expand_more' : 'chevron_right'} size={18} />
          </button>
        ) : (
          <span className="w-[14px]" />
        )}
        <span className={`status-dot ${st.dot}`} />
        <span
          className={`font-mono text-[12px] tracking-wide truncate ${
            isSelected
              ? 'text-primary-container'
              : isGroup
              ? 'text-on-surface-variant'
              : 'text-on-surface'
          }`}
        >
          {node.id}
        </span>
        {node.status !== 'ok' && (
          <Icon
            name={node.status === 'critical' ? 'error' : 'warning'}
            size={14}
            fill={1}
            className="ml-auto"
            style={{ color: st.color }}
          />
        )}
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((c) => (
            <TreeNode
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComponentTree({ selectedId, hoveredId, onSelect, onHover }) {
  return (
    <aside className="glass-panel pointer-events-auto w-[290px] flex flex-col rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Icon name="account_tree" className="text-primary-container" size={20} />
          <h2 className="font-poppins text-[16px] font-semibold text-on-surface">
            Component Hierarchy
          </h2>
        </div>
        <p className="font-mono text-[10px] tracking-wider text-on-surface-variant mt-1">
          SHELL → CHASSIS → MODULES
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 max-h-[calc(100vh-260px)]">
        {tree.map((n) => (
          <TreeNode
            key={n.id}
            node={n}
            depth={0}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between font-mono text-[10px] tracking-wider text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="status-dot status-ok" /> OK
        </span>
        <span className="flex items-center gap-1.5">
          <span className="status-dot status-warn" /> WARN
        </span>
        <span className="flex items-center gap-1.5">
          <span className="status-dot status-crit" /> CRIT
        </span>
      </div>
    </aside>
  )
}
