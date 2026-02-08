import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { GripVertical, ChevronDown, ChevronRight, Folder, FileText } from "lucide-react";

interface DragDropItem {
  id: string;
  title: string;
  parentId?: string | null;
  order: number;
  children?: DragDropItem[];
  [key: string]: any;
}

interface DragDropListProps {
  items: DragDropItem[];
  onReorder: (items: DragDropItem[]) => void;
  renderItem?: (item: DragDropItem, depth: number) => React.ReactNode;
  allowNesting?: boolean;
  maxDepth?: number;
}

interface TreeNode extends DragDropItem {
  children: TreeNode[];
  depth: number;
}

// Convert flat list to tree structure
function buildTree(items: DragDropItem[]): TreeNode[] {
  const itemMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: create all nodes
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [], depth: 0 });
  });

  // Second pass: build tree
  items.forEach((item) => {
    const node = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by order
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(roots);

  return roots;
}

// Flatten tree back to list
function flattenTree(nodes: TreeNode[], parentId: string | null = null): DragDropItem[] {
  const result: DragDropItem[] = [];
  nodes.forEach((node, index) => {
    const { children, depth, ...item } = node;
    result.push({ ...item, parentId, order: index });
    if (children.length > 0) {
      result.push(...flattenTree(children as TreeNode[], node.id));
    }
  });
  return result;
}

interface DraggableItemProps {
  node: TreeNode;
  onReorder: (items: TreeNode[]) => void;
  renderItem?: (item: DragDropItem, depth: number) => React.ReactNode;
  allowNesting: boolean;
  maxDepth: number;
}

function DraggableItem({
  node,
  onReorder,
  renderItem,
  allowNesting,
  maxDepth,
}: DraggableItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const canHaveChildren = allowNesting && node.depth < maxDepth;

  return (
    <div className="select-none">
      <motion.div
        layout
        layoutId={node.id}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-white/20
          transition-colors cursor-grab active:cursor-grabbing
        `}
        style={{ marginRight: `${node.depth * 24}px` }}
      >
        {/* Drag Handle */}
        <div className="text-gray-500 hover:text-gray-300">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Expand/Collapse for parent items */}
        {canHaveChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              hasChildren ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Icon */}
        {hasChildren ? (
          <Folder className="h-4 w-4 text-blue-400" />
        ) : (
          <FileText className="h-4 w-4 text-gray-400" />
        )}

        {/* Content */}
        <div className="flex-1">
          {renderItem ? (
            renderItem(node, node.depth)
          ) : (
            <span className="text-white">{node.title}</span>
          )}
        </div>

        {/* Order indicator */}
        <span className="text-xs text-gray-500">#{node.order + 1}</span>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-1"
          >
            {node.children.map((child) => (
              <DraggableItem
                key={child.id}
                node={child}
                onReorder={onReorder}
                renderItem={renderItem}
                allowNesting={allowNesting}
                maxDepth={maxDepth}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DragDropList({
  items,
  onReorder,
  renderItem,
  allowNesting = true,
  maxDepth = 3,
}: DragDropListProps) {
  const [tree, setTree] = useState<TreeNode[]>(() => buildTree(items));
  const draggedItemRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((itemId: string) => {
    draggedItemRef.current = itemId;
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItemRef.current && draggedItemRef.current !== targetId) {
      setDragOverId(targetId);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const draggedId = draggedItemRef.current;
      if (!draggedId || draggedId === targetId) {
        setDragOverId(null);
        return;
      }

      // Find and move the item
      const newTree = [...tree];

      // Find dragged item and remove it
      const findAndRemove = (nodes: TreeNode[], id: string): TreeNode | null => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            return nodes.splice(i, 1)[0];
          }
          const found = findAndRemove(nodes[i].children, id);
          if (found) return found;
        }
        return null;
      };

      // Find target index
      const findTargetIndex = (nodes: TreeNode[], id: string): number => {
        return nodes.findIndex((n) => n.id === id);
      };

      const draggedItem = findAndRemove(newTree, draggedId);
      if (draggedItem) {
        const targetIndex = findTargetIndex(newTree, targetId);
        if (targetIndex !== -1) {
          newTree.splice(targetIndex, 0, draggedItem);
        }
      }

      setTree(newTree);
      onReorder(flattenTree(newTree));
      setDragOverId(null);
      draggedItemRef.current = null;
    },
    [tree, onReorder]
  );

  // Simple reorder handler for Reorder component
  const handleReorder = useCallback(
    (newOrder: TreeNode[]) => {
      setTree(newOrder);
      onReorder(flattenTree(newOrder));
    },
    [onReorder]
  );

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-lg">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>אין פריטים להצגה</p>
        <p className="text-sm mt-1">הוסף פריטים כדי להתחיל לסדר</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 rounded-lg px-3 py-2">
        <GripVertical className="h-4 w-4" />
        <span>גרור פריטים כדי לשנות את הסדר</span>
      </div>

      {/* Reorderable List */}
      <Reorder.Group
        axis="y"
        values={tree}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {tree.map((node) => (
          <Reorder.Item
            key={node.id}
            value={node}
            className="cursor-grab active:cursor-grabbing"
          >
            <DraggableItem
              node={node}
              onReorder={handleReorder}
              renderItem={renderItem}
              allowNesting={allowNesting}
              maxDepth={maxDepth}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/10">
        <span>{items.length} פריטים</span>
        <span>עומק מקסימלי: {maxDepth}</span>
      </div>
    </div>
  );
}

export default DragDropList;
