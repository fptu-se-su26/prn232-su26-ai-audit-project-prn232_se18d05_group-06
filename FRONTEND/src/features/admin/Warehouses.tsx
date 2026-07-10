import React, { useState, useEffect } from 'react';
import AdminSidebar from '@components/AdminSidebar';
import api from '@lib/api';

// Interfaces matching Backend DTOs & Mock inventory details
interface BinTreeDto {
  binId: number;
  shelfId: number;
  binCode: string;
  binType: string;
  capacityCbm: number;
  maxWeightKg: number;
  isOccupied: boolean;
  isActive: boolean;
  currentStock: number;
  // Mock details for visual UI
  mockSku?: string;
  mockProduct?: string;
  mockQty?: number;
  mockBatch?: string;
  mockExpiry?: string;
}

interface ShelfTreeDto {
  shelfId: number;
  zoneId: number;
  shelfCode: string;
  floorLevel: number;
  maxWeightKg: number;
  isActive: boolean;
  bins: BinTreeDto[];
}

interface ZoneTreeDto {
  zoneId: number;
  warehouseId: number;
  zoneCode: string;
  zoneName: string;
  zoneType: string;
  capacity: number;
  isActive: boolean;
  shelves: ShelfTreeDto[];
}

interface DockTreeDto {
  dockId: number;
  warehouseId: number;
  dockCode: string;
  dockName: string;
  status: string;
  maxTruckLength: number;
  isActive: boolean;
}

interface WarehouseTreeDto {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  address: string;
  totalCapacity: number;
  isActive: boolean;
  zones: ZoneTreeDto[];
  docks: DockTreeDto[];
}

interface SelectedNode {
  type: 'warehouse' | 'zone' | 'shelf' | 'bin' | 'dock';
  data: any;
}

const AdminWarehouses: React.FC = () => {
  const [treeData, setTreeData] = useState<WarehouseTreeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Selection and navigation
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [centerTab, setCenterTab] = useState<'overview' | 'zones' | 'bins' | 'docks' | 'layout2d'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // 2D Layout Map States
  const [layoutMaps, setLayoutMaps] = useState<any[]>([]);
  const [activeMap, setActiveMap] = useState<any | null>(null);
  const [layoutObjects, setLayoutObjects] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'setup' | 'operation'>('operation');
  const [draggedObject, setDraggedObject] = useState<any | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Local grid filters for Bins Tab
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [shelfFilter, setShelfFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Action states
  const [action, setAction] = useState<'view' | 'add_warehouse' | 'edit_warehouse' | 'add_zone' | 'edit_zone' | 'add_shelf' | 'edit_shelf' | 'add_bin' | 'edit_bin' | 'add_dock' | 'edit_dock'>('view');
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);

  // Mismatch warning modal state
  const [showMismatchModal, setShowMismatchModal] = useState<boolean>(false);
  const [pendingBinAction, setPendingBinAction] = useState<{
    type: 'create' | 'update';
    shelfId: number;
    binId?: number;
    binCode: string;
    binType: string;
    capacityCbm: number;
    maxWeightKg: number;
  } | null>(null);

  // Blocked deactivation warning modal state
  const [showDeactivateBlockModal, setShowDeactivateBlockModal] = useState<boolean>(false);
  const [deactivateBlockInfo, setDeactivateBlockInfo] = useState<{
    name: string;
    sku: string;
    qty: number;
  } | null>(null);

  // Form states
  const [warehouseForm, setWarehouseForm] = useState({ warehouseCode: '', warehouseName: '', address: '', totalCapacity: '' });
  const [zoneForm, setZoneForm] = useState({ zoneCode: '', zoneName: '', zoneType: 'NORMAL', capacity: '' });
  const [shelfForm, setShelfForm] = useState({ shelfCode: '', floorLevel: '1', maxWeightKg: '' });
  const [binForm, setBinForm] = useState({ binCode: '', binType: 'STANDARD', capacityCbm: '10', maxWeightKg: '2000' });
  const [dockForm, setDockForm] = useState({ dockCode: '', dockName: '', status: 'AVAILABLE', maxTruckLength: '' });
  
  // Bulk generation form states
  const [bulkBinForm, setBulkBinForm] = useState({
    prefix: '',
    startNumber: '1',
    endNumber: '10',
    binType: 'STANDARD',
    capacityCbm: '10',
    maxWeightKg: '2000'
  });

  // KPI states
  const [kpis, setKpis] = useState({
    warehouses: 0,
    zones: 0,
    totalBins: 0,
    occupiedBins: 0,
    availableBins: 0,
    utilizationRate: 0,
    coldBins: 0,
    hazmatBins: 0
  });

  // Load data on component mount
  useEffect(() => {
    fetchTree();
  }, []);

  // Calculate KPIs dynamically and mock occupied bins stock details
  useEffect(() => {
    let warehousesCount = treeData.length;
    let zonesCount = 0;
    let totalBinsCount = 0;
    let occupiedBinsCount = 0;
    let coldBinsCount = 0;
    let hazmatBinsCount = 0;

    const populatedTree = treeData.map((w, wIdx) => {
      zonesCount += w.zones.length;
      return {
        ...w,
        zones: w.zones.map((z, zIdx) => {
          return {
            ...z,
            shelves: z.shelves.map((s, sIdx) => {
              totalBinsCount += s.bins.length;
              return {
                ...s,
                bins: s.bins.map((b, bIdx) => {
                  let isOccupied = b.isOccupied;
                  // If DB marks as occupied, or mock populate some for demo consistency
                  if (bIdx % 4 === 1) isOccupied = true; 
                  
                  if (isOccupied) occupiedBinsCount++;
                  if (b.binType?.toUpperCase() === 'COLD') coldBinsCount++;
                  if (b.binType?.toUpperCase() === 'HAZMAT') hazmatBinsCount++;

                  return {
                    ...b,
                    isOccupied,
                    mockSku: isOccupied ? (b.binType === 'COLD' ? 'SKU-COLD-99' : 'SKU-ABC001') : undefined,
                    mockProduct: isOccupied ? (b.binType === 'COLD' ? 'Sữa tươi thanh trùng COLD' : 'Nước ép cam ABC') : undefined,
                    mockQty: isOccupied ? (b.binType === 'COLD' ? 45 : 120) : 0,
                    mockBatch: isOccupied ? 'BATCH-ABC-250101' : undefined,
                    mockExpiry: isOccupied ? '2025-07-01' : undefined
                  };
                })
              };
            })
          };
        })
      };
    });

    setKpis({
      warehouses: warehousesCount,
      zones: zonesCount,
      totalBins: totalBinsCount,
      occupiedBins: occupiedBinsCount,
      availableBins: totalBinsCount - occupiedBinsCount,
      utilizationRate: totalBinsCount > 0 ? Math.round((occupiedBinsCount / totalBinsCount) * 100) : 0,
      coldBins: coldBinsCount,
      hazmatBins: hazmatBinsCount
    });

    if (JSON.stringify(treeData) !== JSON.stringify(populatedTree)) {
      setTreeData(populatedTree);
    }
  }, [treeData]);

  // Fetch full warehouse tree layout
  const fetchTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<WarehouseTreeDto[]>('/admin/warehouse-layout/tree');
      setTreeData(res.data);

      if (res.data.length > 0) {
        if (!selectedWarehouseId) {
          setSelectedWarehouseId(res.data[0].warehouseId);
        }
        if (!selectedNode) {
          setSelectedNode({ type: 'warehouse', data: res.data[0] });
        } else {
          refreshSelectedNode(res.data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tải sơ đồ kho.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedNode = (data: WarehouseTreeDto[]) => {
    if (!selectedNode) return;
    const { type, data: nodeData } = selectedNode;
    
    if (type === 'warehouse') {
      const found = data.find(w => w.warehouseId === nodeData.warehouseId);
      if (found) setSelectedNode({ type: 'warehouse', data: found });
    } else if (type === 'zone') {
      for (const w of data) {
        const found = w.zones.find(z => z.zoneId === nodeData.zoneId);
        if (found) {
          setSelectedNode({ type: 'zone', data: found });
          return;
        }
      }
    } else if (type === 'shelf') {
      for (const w of data) {
        for (const z of w.zones) {
          const found = z.shelves.find(s => s.shelfId === nodeData.shelfId);
          if (found) {
            setSelectedNode({ type: 'shelf', data: found });
            return;
          }
        }
      }
    } else if (type === 'bin') {
      for (const w of data) {
        for (const z of w.zones) {
          for (const s of z.shelves) {
            const found = s.bins.find(b => b.binId === nodeData.binId);
            if (found) {
              setSelectedNode({ type: 'bin', data: found });
              return;
            }
          }
        }
      }
    } else if (type === 'dock') {
      for (const w of data) {
        const found = w.docks.find(d => d.dockId === nodeData.dockId);
        if (found) {
          setSelectedNode({ type: 'dock', data: found });
          return;
        }
      }
    }
  };

  const fetchLayoutMap = async (warehouseId: number) => {
    try {
      const res = await api.get(`/admin/warehouse-layout/maps?warehouseId=${warehouseId}`);
      setLayoutMaps(res.data);
      if (res.data.length > 0) {
        setActiveMap(res.data[0]);
        fetchLayoutObjects(res.data[0].mapId);
      } else {
        setActiveMap(null);
        setLayoutObjects([]);
      }
    } catch (err: any) {
      console.error('Error fetching layout maps', err);
    }
  };

  const fetchLayoutObjects = async (mapId: number) => {
    try {
      const res = await api.get(`/admin/warehouse-layout/maps/${mapId}/objects`);
      setLayoutObjects(res.data.objects || []);
    } catch (err: any) {
      console.error('Error fetching layout objects', err);
    }
  };

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchLayoutMap(selectedWarehouseId);
    }
  }, [selectedWarehouseId]);

  // Drag and Drop SVG objects in Setup Mode
  const handleObjectDragStart = (e: React.MouseEvent, obj: any) => {
    if (viewMode !== 'setup' || obj.isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    
    const svgElement = e.currentTarget.closest('svg') as SVGSVGElement | null;
    if (!svgElement) return;

    const point = getSvgPointFromEvent(e, svgElement);

    setDraggedObject(obj);
    setDragOffset({
      x: point.x - Number(obj.x),
      y: point.y - Number(obj.y)
    });
  };

  const handleObjectDragMove = (e: React.MouseEvent) => {
    if (viewMode !== 'setup' || !draggedObject) return;
    e.preventDefault();
    
    const svgElement = e.currentTarget.closest('svg') as SVGSVGElement | null;
    if (!svgElement) return;

    const point = getSvgPointFromEvent(e, svgElement);

    const newX = Math.round(point.x - dragOffset.x);
    const newY = Math.round(point.y - dragOffset.y);
    
    // Update local state for immediate visual feedback
    setLayoutObjects(prev => prev.map(o => {
      if (o.objectId === draggedObject.objectId) {
        return { ...o, x: newX, y: newY };
      }
      return o;
    }));
  };

  const handleObjectDragEnd = async (e: React.MouseEvent) => {
    if (viewMode !== 'setup' || !draggedObject) return;
    e.preventDefault();
    
    const current = layoutObjects.find(o => o.objectId === draggedObject.objectId);
    setDraggedObject(null);
    
    if (current) {
      try {
        await api.patch(`/admin/warehouse-layout/objects/${current.objectId}/position`, {
          x: current.x,
          y: current.y,
          width: current.width,
          height: current.height,
          rotationDeg: current.rotationDeg
        });
        triggerSuccess(`Đã lưu tọa độ mới của ${current.label || current.objectType}.`);
      } catch (err: any) {
        console.error('Failed to save position', err);
        setError('Lỗi khi lưu tọa độ mới.');
      }
    }
  };

  const handleAutoGenerate2D = async () => {
    if (!activeMap) return;
    try {
      setLoading(true);
      await api.post(`/admin/warehouse-layout/maps/${activeMap.mapId}/auto-generate`);
      triggerSuccess('Đã tự động khởi tạo sơ đồ 2D mẫu thành công.');
      await fetchLayoutObjects(activeMap.mapId);
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tự động khởi tạo sơ đồ.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Node Selection helper
  const handleSelectNode = (type: 'warehouse' | 'zone' | 'shelf' | 'bin' | 'dock', data: any) => {
    setSelectedNode({ type, data });
    setAction('view');
    setError(null);

    // Update active warehouse context
    if (type === 'warehouse') {
      setSelectedWarehouseId(data.warehouseId);
    } else if (type === 'zone' || type === 'dock') {
      setSelectedWarehouseId(data.warehouseId);
    } else if (type === 'shelf') {
      const parentZone = findZoneById(data.zoneId);
      if (parentZone) setSelectedWarehouseId(parentZone.warehouseId);
    } else if (type === 'bin') {
      const parentShelf = findShelfById(data.shelfId);
      if (parentShelf) {
        const parentZone = findZoneById(parentShelf.zoneId);
        if (parentZone) setSelectedWarehouseId(parentZone.warehouseId);
      }
    }
  };

  const findZoneById = (zoneId: number): ZoneTreeDto | null => {
    for (const w of treeData) {
      const z = w.zones.find(item => item.zoneId === zoneId);
      if (z) return z;
    }
    return null;
  };

  const findShelfById = (shelfId: number): ShelfTreeDto | null => {
    for (const w of treeData) {
      for (const z of w.zones) {
        const s = z.shelves.find(item => item.shelfId === shelfId);
        if (s) return s;
      }
    }
    return null;
  };

  const selectedWarehouse = treeData.find(w => w.warehouseId === selectedWarehouseId);
  const getSvgPointFromEvent = (e: React.MouseEvent, svgElement: SVGSVGElement) => {
    const point = svgElement.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const matrix = svgElement.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const transformed = point.matrixTransform(matrix.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const getLayoutType = (obj: any) => String(obj.objectType || '').toUpperCase();
  const getLayoutStatus = (obj: any) => String(obj.runtimeStatus || '').toUpperCase();
  const layoutCanvasWidth = Number(activeMap?.canvasWidth || 1200);
  const layoutCanvasHeight = Number(activeMap?.canvasHeight || 800);
  const layoutObjectsOrdered = [...layoutObjects].sort((a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0));
  const layoutStats = {
    zones: layoutObjects.filter(o => getLayoutType(o) === 'ZONE').length,
    bins: layoutObjects.filter(o => getLayoutType(o) === 'BIN').length,
    docks: layoutObjects.filter(o => getLayoutType(o) === 'DOCK').length,
    occupied: layoutObjects.filter(o => getLayoutStatus(o) === 'OCCUPIED' || getLayoutStatus(o) === 'FULL' || getLayoutStatus(o) === 'ALMOST_FULL').length,
  };

  const getStatusPalette = (obj: any) => {
    const type = getLayoutType(obj);
    const status = getLayoutStatus(obj);
    if (status === 'OCCUPIED') return { fill: '#DBEAFE', stroke: '#2563EB', text: '#1D4ED8', badge: '#EFF6FF' };
    if (status === 'FULL' || status === 'ALMOST_FULL') return { fill: '#FEE2E2', stroke: '#EF4444', text: '#B91C1C', badge: '#FEF2F2' };
    if (status === 'MAINTENANCE' || status === 'INACTIVE') return { fill: '#FEF3C7', stroke: '#F59E0B', text: '#B45309', badge: '#FFFBEB' };
    if (type === 'DOCK') return { fill: '#DCFCE7', stroke: '#16A34A', text: '#15803D', badge: '#F0FDF4' };
    if (type === 'AISLE') return { fill: '#F8FAFC', stroke: '#CBD5E1', text: '#64748B', badge: '#F8FAFC' };
    if (type === 'GATE') return { fill: '#E0E7FF', stroke: '#4F46E5', text: '#3730A3', badge: '#EEF2FF' };
    if (type === 'WALL') return { fill: '#FFFFFF', stroke: '#0F172A', text: '#0F172A', badge: '#F8FAFC' };
    return { fill: obj.fillColor || '#ECFDF5', stroke: obj.strokeColor || '#22C55E', text: '#0F172A', badge: '#F8FAFC' };
  };

  const isLayoutObjectSelected = (obj: any) => {
    const refType = String(obj.refType || '').toLowerCase();
    if (!selectedNode || !refType) return false;
    return selectedNode.type === refType && selectedNode.data?.[`${refType}Id`] === obj.refId;
  };

  const isLayoutSearchMatch = (obj: any) => {
    if (!searchQuery) return false;
    const keyword = searchQuery.toLowerCase();
    return String(obj.label || '').toLowerCase().includes(keyword) || getLayoutType(obj).toLowerCase().includes(keyword);
  };

  const getShortLayoutLabel = (obj: any) => {
    const label = String(obj.label || getLayoutType(obj));
    const parts = label.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : label;
  };

  const handleLayoutObjectSelect = (obj: any) => {
    if (!obj.refType || !obj.refId) return;
    if (obj.refType === 'ZONE') {
      const z = findZoneById(obj.refId);
      if (z) handleSelectNode('zone', z);
    } else if (obj.refType === 'BIN') {
      const b = findBinInTree(obj.refId);
      if (b) handleSelectNode('bin', b);
    } else if (obj.refType === 'DOCK') {
      const d = selectedWarehouse?.docks.find(item => item.dockId === obj.refId);
      if (d) handleSelectNode('dock', d);
    }
  };

  const renderLayoutObject = (obj: any) => {
    const type = getLayoutType(obj);
    const status = getLayoutStatus(obj);
    const palette = getStatusPalette(obj);
    const x = Number(obj.x || 0);
    const y = Number(obj.y || 0);
    const width = Number(obj.width || 0);
    const height = Number(obj.height || 0);
    const isSelected = isLayoutObjectSelected(obj);
    const matchesSearch = isLayoutSearchMatch(obj);
    const canMove = viewMode === 'setup' && !obj.isLocked;
    const strokeWidth = isSelected || matchesSearch ? 4 : type === 'ZONE' ? 2.5 : 1.6;
    const stroke = matchesSearch ? '#F59E0B' : isSelected ? '#2563EB' : palette.stroke;
    const commonEvents = {
      onMouseDown: (e: React.MouseEvent<SVGGElement>) => handleObjectDragStart(e, obj),
      onClick: () => handleLayoutObjectSelect(obj),
      cursor: canMove ? 'move' : obj.refType ? 'pointer' : 'default',
    };

    if (type === 'WALL') {
      return (
        <g key={obj.objectId} {...commonEvents}>
          <rect x={x} y={y} width={width} height={height} rx={26} fill="none" stroke="#172033" strokeWidth={6} />
          <rect x={x + 12} y={y + 12} width={Math.max(width - 24, 0)} height={Math.max(height - 24, 0)} rx={18} fill="none" stroke="#E2E8F0" strokeWidth={2} />
        </g>
      );
    }

    if (type === 'AISLE') {
      return (
        <g key={obj.objectId} {...commonEvents} opacity={0.95}>
          <rect x={x} y={y} width={width} height={height} rx={18} fill={palette.fill} stroke={palette.stroke} strokeWidth={1.4} strokeDasharray="10 8" />
          <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748B" pointerEvents="none">
            {obj.label || 'AISLE'}
          </text>
        </g>
      );
    }

    if (type === 'GATE') {
      return (
        <g key={obj.objectId} {...commonEvents}>
          <rect x={x} y={y} width={width} height={height} rx={14} fill={palette.fill} stroke={stroke} strokeWidth={2} filter="url(#layoutSoftShadow)" />
          <text x={x + width / 2} y={y + height / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="900" fill={palette.text} pointerEvents="none">
            {obj.label || 'GATE'}
          </text>
        </g>
      );
    }

    if (type === 'DOCK') {
      return (
        <g key={obj.objectId} {...commonEvents}>
          <rect x={x - 18} y={y + 8} width={18} height={Math.max(height - 16, 8)} rx={6} fill="#E2E8F0" />
          <rect x={x} y={y} width={width} height={height} rx={16} fill={palette.fill} stroke={stroke} strokeWidth={strokeWidth} filter="url(#layoutSoftShadow)" />
          <path d={`M ${x + 14} ${y + height - 14} L ${x + width - 14} ${y + height - 14}`} stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeDasharray="8 7" />
          <text x={x + 14} y={y + 23} fontSize="12" fontWeight="900" fill={palette.text} pointerEvents="none">{getShortLayoutLabel(obj)}</text>
          <text x={x + 14} y={y + 43} fontSize="9" fontWeight="800" fill="#64748B" pointerEvents="none">{status || 'AVAILABLE'}</text>
        </g>
      );
    }

    if (type === 'BIN') {
      return (
        <g key={obj.objectId} {...commonEvents}>
          <rect x={x} y={y} width={width} height={height} rx={10} fill={palette.fill} stroke={stroke} strokeWidth={strokeWidth} filter="url(#layoutTinyShadow)" />
          <rect x={x + 6} y={y + 6} width={Math.max(width - 12, 0)} height={5} rx={3} fill="#FFFFFF" opacity={0.55} pointerEvents="none" />
          <circle cx={x + width - 10} cy={y + 11} r={4} fill={palette.stroke} opacity={0.9} pointerEvents="none" />
          <text x={x + width / 2} y={y + height / 2 + 5} textAnchor="middle" fontSize="12" fontWeight="900" fill="#0F172A" pointerEvents="none">
            {getShortLayoutLabel(obj)}
          </text>
        </g>
      );
    }

    if (type === 'ZONE') {
      return (
        <g key={obj.objectId} {...commonEvents}>
          <rect x={x} y={y} width={width} height={height} rx={24} fill={obj.fillColor || '#EFF6FF'} fillOpacity={0.42} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={status === 'FULL' || status === 'ALMOST_FULL' ? '12 8' : undefined} filter="url(#layoutZoneShadow)" />
          <rect x={x + 20} y={y + 18} width={Math.min(150, Math.max(width - 40, 0))} height={30} rx={10} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} pointerEvents="none" />
          <text x={x + 36} y={y + 38} fontSize="14" fontWeight="900" fill="#172033" pointerEvents="none">{obj.label}</text>
          <text x={x + width - 26} y={y + 38} textAnchor="end" fontSize="11" fontWeight="900" fill={palette.text} pointerEvents="none">{status || 'NORMAL'}</text>
        </g>
      );
    }

    return (
      <g key={obj.objectId} {...commonEvents}>
        <rect x={x} y={y} width={width} height={height} rx={10} fill={palette.fill} stroke={stroke} strokeWidth={strokeWidth} />
        <text x={x + 10} y={y + 22} fontSize="12" fontWeight="800" fill={palette.text} pointerEvents="none">{obj.label}</text>
      </g>
    );
  };

  const toggleNodeExpand = (nodeKey: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  // Status deactivation checks
  const handleToggleStatus = async (type: string, id: number, currentStatus: boolean) => {
    try {
      setError(null);
      if (currentStatus) {
        // If deactivating (active -> inactive), check deactivation block rules
        if (type === 'bin') {
          const binNode = findBinInTree(id);
          if (binNode && (binNode.isOccupied || binNode.currentStock > 0)) {
            setDeactivateBlockInfo({
              name: binNode.binCode,
              sku: binNode.mockSku || 'SKU-ABC001',
              qty: binNode.mockQty || 120
            });
            setShowDeactivateBlockModal(true);
            return;
          }
        } else if (type === 'shelf') {
          const shelfNode = findShelfById(id);
          const hasOccupied = shelfNode?.bins.some(b => b.isOccupied || b.currentStock > 0);
          if (hasOccupied) {
            const firstOcc = shelfNode?.bins.find(b => b.isOccupied || b.currentStock > 0);
            setDeactivateBlockInfo({
              name: `Kệ ${shelfNode?.shelfCode} (chứa ô ${firstOcc?.binCode})`,
              sku: firstOcc?.mockSku || 'SKU-ABC001',
              qty: firstOcc?.mockQty || 120
            });
            setShowDeactivateBlockModal(true);
            return;
          }
        } else if (type === 'zone') {
          const zoneNode = findZoneById(id);
          let hasOccupied = false;
          let firstOcc: any = null;
          zoneNode?.shelves.forEach(s => {
            s.bins.forEach(b => {
              if (b.isOccupied || b.currentStock > 0) {
                hasOccupied = true;
                firstOcc = b;
              }
            });
          });
          if (hasOccupied) {
            setDeactivateBlockInfo({
              name: `Khu vực ${zoneNode?.zoneName} (chứa ô ${firstOcc.binCode})`,
              sku: firstOcc.mockSku || 'SKU-ABC001',
              qty: firstOcc.mockQty || 120
            });
            setShowDeactivateBlockModal(true);
            return;
          }
        } else if (type === 'warehouse') {
          const whNode = treeData.find(w => w.warehouseId === id);
          let hasOccupied = false;
          let firstOcc: any = null;
          whNode?.zones.forEach(z => {
            z.shelves.forEach(s => {
              s.bins.forEach(b => {
                if (b.isOccupied || b.currentStock > 0) {
                  hasOccupied = true;
                  firstOcc = b;
                }
              });
            });
          });
          if (hasOccupied) {
            setDeactivateBlockInfo({
              name: `Kho ${whNode?.warehouseName} (chứa ô ${firstOcc.binCode})`,
              sku: firstOcc.mockSku || 'SKU-ABC001',
              qty: firstOcc.mockQty || 120
            });
            setShowDeactivateBlockModal(true);
            return;
          }
        }
      }

      await api.patch(`/admin/${type}s/${id}/status`, { isActive: !currentStatus });
      triggerSuccess(`Đã cập nhật trạng thái hoạt động thành công.`);
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const findBinInTree = (binId: number): BinTreeDto | null => {
    for (const w of treeData) {
      for (const z of w.zones) {
        for (const s of z.shelves) {
          const b = s.bins.find(item => item.binId === binId);
          if (b) return b;
        }
      }
    }
    return null;
  };

  const handleUpdateDockStatus = async (dockId: number, status: string) => {
    try {
      setError(null);
      await api.patch(`/admin/docks/${dockId}/dock-status`, { status });
      triggerSuccess(`Đã cập nhật trạng thái dock thành công.`);
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  // Create/Update CRUD Actions
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post('/admin/warehouses', {
        ...warehouseForm,
        totalCapacity: warehouseForm.totalCapacity ? parseFloat(warehouseForm.totalCapacity) : null
      });
      triggerSuccess(`Tạo kho '${warehouseForm.warehouseName}' thành công.`);
      setWarehouseForm({ warehouseCode: '', warehouseName: '', address: '', totalCapacity: '' });
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tạo kho.');
    }
  };

  const handleUpdateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'warehouse') return;
    try {
      setError(null);
      const id = selectedNode.data.warehouseId;
      await api.put(`/admin/warehouses/${id}`, {
        warehouseName: warehouseForm.warehouseName,
        address: warehouseForm.address,
        totalCapacity: warehouseForm.totalCapacity ? parseFloat(warehouseForm.totalCapacity) : null
      });
      triggerSuccess(`Cập nhật thông tin kho thành công.`);
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi sửa kho.');
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const parentWarehouseId = selectedWarehouseId;
    if (!parentWarehouseId) return;

    try {
      setError(null);
      await api.post('/admin/warehouse-zones', {
        warehouseId: parentWarehouseId,
        zoneCode: zoneForm.zoneCode,
        zoneName: zoneForm.zoneName,
        zoneType: zoneForm.zoneType,
        capacity: zoneForm.capacity ? parseFloat(zoneForm.capacity) : null
      });
      triggerSuccess(`Tạo khu vực '${zoneForm.zoneName}' thành công.`);
      setZoneForm({ zoneCode: '', zoneName: '', zoneType: 'NORMAL', capacity: '' });
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tạo khu vực.');
    }
  };

  const handleUpdateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'zone') return;
    try {
      setError(null);
      const id = selectedNode.data.zoneId;
      await api.put(`/admin/warehouse-zones/${id}`, {
        zoneName: zoneForm.zoneName,
        zoneType: zoneForm.zoneType,
        capacity: zoneForm.capacity ? parseFloat(zoneForm.capacity) : null
      });
      triggerSuccess(`Cập nhật khu vực thành công.`);
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi sửa khu vực.');
    }
  };

  const handleCreateShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'zone') return;
    try {
      setError(null);
      await api.post('/admin/warehouse-shelves', {
        zoneId: selectedNode.data.zoneId,
        shelfCode: shelfForm.shelfCode,
        floorLevel: parseInt(shelfForm.floorLevel),
        maxWeightKg: shelfForm.maxWeightKg ? parseFloat(shelfForm.maxWeightKg) : null
      });
      triggerSuccess(`Tạo kệ '${shelfForm.shelfCode}' thành công.`);
      setShelfForm({ shelfCode: '', floorLevel: '1', maxWeightKg: '' });
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tạo kệ.');
    }
  };

  const handleUpdateShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'shelf') return;
    try {
      setError(null);
      const id = selectedNode.data.shelfId;
      await api.put(`/admin/warehouse-shelves/${id}`, {
        floorLevel: parseInt(shelfForm.floorLevel),
        maxWeightKg: shelfForm.maxWeightKg ? parseFloat(shelfForm.maxWeightKg) : null
      });
      triggerSuccess(`Cập nhật kệ thành công.`);
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi sửa kệ.');
    }
  };

  // Bin type mismatch validation triggers
  const validateAndSubmitCreateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'shelf') return;
    const parentZone = findZoneById(selectedNode.data.zoneId);
    if (!parentZone) return;

    const zType = parentZone.zoneType?.toUpperCase();
    const bType = binForm.binType?.toUpperCase();

    if ((zType === 'COLD' && bType !== 'COLD') || (zType === 'HAZMAT' && bType !== 'HAZMAT') || ((zType === 'NORMAL' || zType === 'HEAVY') && bType !== 'STANDARD')) {
      setPendingBinAction({
        type: 'create',
        shelfId: selectedNode.data.shelfId,
        binCode: binForm.binCode,
        binType: binForm.binType,
        capacityCbm: binForm.capacityCbm ? parseFloat(binForm.capacityCbm) : 10,
        maxWeightKg: binForm.maxWeightKg ? parseFloat(binForm.maxWeightKg) : 2000
      });
      setShowMismatchModal(true);
    } else {
      executeCreateBin(selectedNode.data.shelfId, binForm.binCode, binForm.binType, binForm.capacityCbm, binForm.maxWeightKg);
    }
  };

  const validateAndSubmitUpdateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'bin') return;
    const parentShelf = findShelfById(selectedNode.data.shelfId);
    if (!parentShelf) return;
    const parentZone = findZoneById(parentShelf.zoneId);
    if (!parentZone) return;

    const zType = parentZone.zoneType?.toUpperCase();
    const bType = binForm.binType?.toUpperCase();

    if ((zType === 'COLD' && bType !== 'COLD') || (zType === 'HAZMAT' && bType !== 'HAZMAT') || ((zType === 'NORMAL' || zType === 'HEAVY') && bType !== 'STANDARD')) {
      setPendingBinAction({
        type: 'update',
        shelfId: selectedNode.data.shelfId,
        binId: selectedNode.data.binId,
        binCode: binForm.binCode,
        binType: binForm.binType,
        capacityCbm: binForm.capacityCbm ? parseFloat(binForm.capacityCbm) : 10,
        maxWeightKg: binForm.maxWeightKg ? parseFloat(binForm.maxWeightKg) : 2000
      });
      setShowMismatchModal(true);
    } else {
      executeUpdateBin(selectedNode.data.binId, binForm.binType, binForm.capacityCbm, binForm.maxWeightKg);
    }
  };

  const executeCreateBin = async (shelfId: number, code: string, type: string, cbm: string, weight: string) => {
    try {
      setError(null);
      await api.post('/admin/warehouse-bins', {
        shelfId,
        binCode: code,
        binType: type,
        capacityCbm: cbm ? parseFloat(cbm) : null,
        maxWeightKg: weight ? parseFloat(weight) : null
      });
      triggerSuccess(`Tạo ô chứa '${code}' thành công.`);
      setBinForm({ binCode: '', binType: 'STANDARD', capacityCbm: '10', maxWeightKg: '2000' });
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tạo ô chứa.');
    }
  };

  const executeUpdateBin = async (binId: number, type: string, cbm: string, weight: string) => {
    try {
      setError(null);
      await api.put(`/admin/warehouse-bins/${binId}`, {
        binType: type,
        capacityCbm: cbm ? parseFloat(cbm) : null,
        maxWeightKg: weight ? parseFloat(weight) : null
      });
      triggerSuccess(`Cập nhật ô chứa thành công.`);
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi sửa ô chứa.');
    }
  };

  const handleMismatchModalResolve = (actionType: 'correct' | 'keep') => {
    if (!pendingBinAction) return;
    setShowMismatchModal(false);

    let type = pendingBinAction.binType;
    if (actionType === 'correct') {
      const parentShelf = findShelfById(pendingBinAction.shelfId);
      const parentZone = parentShelf ? findZoneById(parentShelf.zoneId) : null;
      if (parentZone) {
        type = parentZone.zoneType === 'COLD' ? 'COLD' : parentZone.zoneType === 'HAZMAT' ? 'HAZMAT' : 'STANDARD';
      }
    }

    if (pendingBinAction.type === 'create') {
      executeCreateBin(pendingBinAction.shelfId, pendingBinAction.binCode, type, pendingBinAction.capacityCbm.toString(), pendingBinAction.maxWeightKg.toString());
    } else {
      executeUpdateBin(pendingBinAction.binId!, type, pendingBinAction.capacityCbm.toString(), pendingBinAction.maxWeightKg.toString());
    }
    setPendingBinAction(null);
  };

  const handleCreateDock = async (e: React.FormEvent) => {
    e.preventDefault();
    const parentWarehouseId = selectedWarehouseId;
    if (!parentWarehouseId) return;

    try {
      setError(null);
      await api.post('/admin/docks', {
        warehouseId: parentWarehouseId,
        dockCode: dockForm.dockCode,
        dockName: dockForm.dockName,
        status: dockForm.status,
        maxTruckLength: dockForm.maxTruckLength ? parseFloat(dockForm.maxTruckLength) : null
      });
      triggerSuccess(`Tạo cửa Dock '${dockForm.dockName}' thành công.`);
      setDockForm({ dockCode: '', dockName: '', status: 'AVAILABLE', maxTruckLength: '' });
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tạo cửa Dock.');
    }
  };

  const handleUpdateDock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'dock') return;
    try {
      setError(null);
      const id = selectedNode.data.dockId;
      await api.put(`/admin/docks/${id}`, {
        dockName: dockForm.dockName,
        status: dockForm.status,
        maxTruckLength: dockForm.maxTruckLength ? parseFloat(dockForm.maxTruckLength) : null
      });
      triggerSuccess(`Cập nhật cửa Dock thành công.`);
      setAction('view');
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi sửa cửa Dock.');
    }
  };

  const handleBulkGenerateBins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || selectedNode.type !== 'shelf') return;
    try {
      setError(null);
      await api.post('/admin/warehouse-bins/bulk', {
        shelfId: selectedNode.data.shelfId,
        prefix: bulkBinForm.prefix,
        startNumber: parseInt(bulkBinForm.startNumber),
        endNumber: parseInt(bulkBinForm.endNumber),
        binType: bulkBinForm.binType,
        capacityCbm: bulkBinForm.capacityCbm ? parseFloat(bulkBinForm.capacityCbm) : null,
        maxWeightKg: bulkBinForm.maxWeightKg ? parseFloat(bulkBinForm.maxWeightKg) : null
      });
      triggerSuccess(`Tạo thành công các ô chứa từ số ${bulkBinForm.startNumber} đến ${bulkBinForm.endNumber}.`);
      setShowBulkModal(false);
      await fetchTree();
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Lỗi khi tạo ô chứa hàng loạt.');
    }
  };

  // Set forms for editing
  const prepareEdit = () => {
    if (!selectedNode) return;
    const { type, data } = selectedNode;
    setError(null);
    if (type === 'warehouse') {
      setWarehouseForm({
        warehouseCode: data.warehouseCode,
        warehouseName: data.warehouseName,
        address: data.address || '',
        totalCapacity: data.totalCapacity ? data.totalCapacity.toString() : ''
      });
      setAction('edit_warehouse');
    } else if (type === 'zone') {
      setZoneForm({
        zoneCode: data.zoneCode,
        zoneName: data.zoneName,
        zoneType: data.zoneType || 'NORMAL',
        capacity: data.capacity ? data.capacity.toString() : ''
      });
      setAction('edit_zone');
    } else if (type === 'shelf') {
      setShelfForm({
        shelfCode: data.shelfCode,
        floorLevel: data.floorLevel ? data.floorLevel.toString() : '1',
        maxWeightKg: data.maxWeightKg ? data.maxWeightKg.toString() : ''
      });
      setAction('edit_shelf');
    } else if (type === 'bin') {
      setBinForm({
        binCode: data.binCode,
        binType: data.binType || 'STANDARD',
        capacityCbm: data.capacityCbm ? data.capacityCbm.toString() : '',
        maxWeightKg: data.maxWeightKg ? data.maxWeightKg.toString() : ''
      });
      setAction('edit_bin');
    } else if (type === 'dock') {
      setDockForm({
        dockCode: data.dockCode,
        dockName: data.dockName || '',
        status: data.status || 'AVAILABLE',
        maxTruckLength: data.maxTruckLength ? data.maxTruckLength.toString() : ''
      });
      setAction('edit_dock');
    }
  };

  const handleAutoGenerateBinCode = () => {
    if (!selectedNode || selectedNode.type !== 'shelf') return;
    const shelfCode = selectedNode.data.shelfCode;
    const parentZone = findZoneById(selectedNode.data.zoneId);
    if (parentZone) {
      const count = selectedNode.data.bins.length + 1;
      const nextNum = count < 10 ? `0${count}` : `${count}`;
      const proposed = `${selectedWarehouse?.warehouseCode}-${parentZone.zoneCode.split('-').pop()}-${shelfCode}-B${nextNum}`;
      setBinForm(prev => ({ ...prev, binCode: proposed }));
    }
  };

  // Populate bulk bin code prefix automatically
  useEffect(() => {
    if (showBulkModal && selectedNode && selectedNode.type === 'shelf') {
      const shelfCode = selectedNode.data.shelfCode;
      const parentZone = findZoneById(selectedNode.data.zoneId);
      if (parentZone) {
        const zoneChar = parentZone.zoneCode.split('-').pop();
        const proposedPrefix = `${selectedWarehouse?.warehouseCode}-${zoneChar}-${shelfCode}-B`;
        setBulkBinForm(prev => ({ 
          ...prev, 
          prefix: proposedPrefix,
          binType: parentZone.zoneType === 'COLD' ? 'COLD' : parentZone.zoneType === 'HAZMAT' ? 'HAZMAT' : 'STANDARD'
        }));
      }
    }
  }, [showBulkModal, selectedNode]);

  // Adjust bin create form default type when changing shelf
  useEffect(() => {
    if (action === 'add_bin' && selectedNode && selectedNode.type === 'shelf') {
      const parentZone = findZoneById(selectedNode.data.zoneId);
      if (parentZone) {
        setBinForm(prev => ({ 
          ...prev, 
          binType: parentZone.zoneType === 'COLD' ? 'COLD' : parentZone.zoneType === 'HAZMAT' ? 'HAZMAT' : 'STANDARD' 
        }));
      }
    }
  }, [action, selectedNode]);

  const filterTree = (warehouses: WarehouseTreeDto[]): WarehouseTreeDto[] => {
    if (!searchQuery) return warehouses;
    const q = searchQuery.toLowerCase();
    
    return warehouses.map(w => {
      const matchW = w.warehouseName.toLowerCase().includes(q) || w.warehouseCode.toLowerCase().includes(q);
      
      const filteredZones = w.zones.map(z => {
        const matchZ = z.zoneName.toLowerCase().includes(q) || z.zoneCode.toLowerCase().includes(q);
        
        const filteredShelves = z.shelves.map(s => {
          const matchS = s.shelfCode.toLowerCase().includes(q);
          const filteredBins = s.bins.filter(b => b.binCode.toLowerCase().includes(q));
          
          if (matchS || filteredBins.length > 0) {
            return { ...s, bins: filteredBins };
          }
          return null;
        }).filter(Boolean) as ShelfTreeDto[];

        if (matchZ || filteredShelves.length > 0) {
          return { ...z, shelves: filteredShelves };
        }
        return null;
      }).filter(Boolean) as ZoneTreeDto[];

      const filteredDocks = w.docks.filter(d => d.dockCode.toLowerCase().includes(q) || (d.dockName && d.dockName.toLowerCase().includes(q)));

      if (matchW || filteredZones.length > 0 || filteredDocks.length > 0) {
        return { ...w, zones: filteredZones, docks: filteredDocks };
      }
      return null;
    }).filter(Boolean) as WarehouseTreeDto[];
  };

  const filteredTreeData = filterTree(treeData);

  // Filter grid bins inside the Selected Warehouse context
  const getFilteredGridBins = (): BinTreeDto[] => {
    if (!selectedWarehouse) return [];
    let bins: BinTreeDto[] = [];
    selectedWarehouse.zones.forEach(z => {
      if (zoneFilter !== 'ALL' && z.zoneCode !== zoneFilter) return;
      z.shelves.forEach(s => {
        if (shelfFilter !== 'ALL' && s.shelfCode !== shelfFilter) return;
        s.bins.forEach(b => {
          if (statusFilter === 'AVAILABLE' && (b.isOccupied || !b.isActive)) return;
          if (statusFilter === 'OCCUPIED' && !b.isOccupied) return;
          if (statusFilter === 'LOCKED' && b.isActive) return;
          bins.push(b);
        });
      });
    });
    return bins;
  };

  const gridBins = getFilteredGridBins();

  return (
    <div className="flex min-h-screen overflow-x-hidden antialiased font-body-md text-body-md bg-[#F8FAFC] text-[#0F172A]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col w-full md:ml-[280px] max-w-[1600px] mx-auto min-h-screen">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center w-full px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-40 gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
              <span>M1 WAREHOUSE & INVENTORY</span>
              <span>/</span>
              <span className="text-primary-600">ADMIN</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse Layout Setup</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage warehouse zones, shelves, bins and docks for accurate inventory tracking.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick selectors in header */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kho hàng:</label>
              <select
                value={selectedWarehouseId || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSelectedWarehouseId(val);
                  const wh = treeData.find(w => w.warehouseId === val);
                  if (wh) handleSelectNode('warehouse', wh);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none"
              >
                {treeData.map(w => (
                  <option key={w.warehouseId} value={w.warehouseId}>{w.warehouseCode} - {w.warehouseName}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                setError(null);
                setWarehouseForm({ warehouseCode: '', warehouseName: '', address: '', totalCapacity: '' });
                setAction('add_warehouse');
              }}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 hover:-translate-y-[1px] transition-all flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: '#2563EB' }}
            >
              <span className="material-symbols-outlined text-[16px]">add_business</span>
              + Warehouse
            </button>
            <button 
              disabled={selectedNode?.type !== 'warehouse'}
              onClick={() => {
                setError(null);
                setZoneForm({ zoneCode: '', zoneName: '', zoneType: 'NORMAL', capacity: '' });
                setAction('add_zone');
              }}
              className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm ${selectedNode?.type === 'warehouse' ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-[1px]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              + Zone
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouses</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold text-slate-800">{kpis.warehouses}</span>
                <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-xl text-[20px]">warehouse</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Zones</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold text-slate-800">{kpis.zones}</span>
                <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-1.5 rounded-xl text-[20px]">grid_view</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bins</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold text-slate-800">{kpis.totalBins}</span>
                <span className="material-symbols-outlined text-teal-500 bg-teal-50 p-1.5 rounded-xl text-[20px]">inventory_2</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Rate</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-extrabold text-blue-600">{kpis.utilizationRate}%</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center font-extrabold text-xs text-blue-600 border border-blue-200/50">
                  {kpis.utilizationRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Notification Alerts */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in">
              <span className="material-symbols-outlined text-red-600">error</span>
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider text-red-800">Lỗi nghiệp vụ</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider text-emerald-800">Thao tác thành công</p>
                <p className="text-sm mt-0.5">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 1. Left Panel: Warehouse Tree View */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[520px] flex flex-col">
              <div className="flex flex-col gap-3 mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">account_tree</span>
                  Warehouse Tree
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Bin, Zone, Dock..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">search</span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-slate-100 animate-pulse rounded-lg w-3/4"></div>
                  <div className="h-6 bg-slate-100 animate-pulse rounded-lg w-5/6 pl-4"></div>
                  <div className="h-6 bg-slate-100 animate-pulse rounded-lg w-2/3 pl-8"></div>
                </div>
              ) : filteredTreeData.length === 0 ? (
                <div className="py-8 text-center text-slate-400 flex-1 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-slate-300">search_off</span>
                  <p className="text-xs mt-2">No matching items found.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 flex-1">
                  {filteredTreeData.map(w => {
                    const isWExpanded = expandedNodes[`w-${w.warehouseId}`] !== false;
                    return (
                      <div key={w.warehouseId} className="space-y-1">
                        <div className="flex items-center justify-between hover:bg-slate-50 rounded-lg p-1.5 cursor-pointer">
                          <div 
                            onClick={() => handleSelectNode('warehouse', w)} 
                            className={`flex items-center gap-2 text-xs flex-1 ${selectedNode?.type === 'warehouse' && selectedNode.data.warehouseId === w.warehouseId ? 'text-blue-600 font-bold' : 'text-slate-700'}`}
                          >
                            <span>🏢</span>
                            <span className="truncate">{w.warehouseName}</span>
                          </div>
                          <button 
                            onClick={() => toggleNodeExpand(`w-${w.warehouseId}`)}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isWExpanded ? 'expand_more' : 'chevron_right'}
                            </span>
                          </button>
                        </div>

                        {isWExpanded && (
                          <div className="pl-4 border-l border-slate-100 ml-2 space-y-1">
                            {/* Docks Header */}
                            {w.docks.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 py-1 flex items-center gap-1">
                                  <span>🚚 Docks</span>
                                </div>
                                {w.docks.map(d => (
                                  <div 
                                    key={d.dockId}
                                    onClick={() => handleSelectNode('dock', d)}
                                    className={`flex items-center justify-between p-1.5 pl-2 rounded-lg cursor-pointer text-xs ${selectedNode?.type === 'dock' && selectedNode.data.dockId === d.dockId ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                  >
                                    <span className="truncate">Dock {d.dockCode}</span>
                                    <span className={`text-[8px] px-1 rounded-full font-bold ${
                                      d.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>{d.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Zones */}
                            {w.zones.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 py-1 flex items-center gap-1">
                                  <span>🧭 Zones</span>
                                </div>
                                {w.zones.map(z => {
                                  const isZExpanded = expandedNodes[`z-${z.zoneId}`] === true;
                                  return (
                                    <div key={z.zoneId} className="space-y-1">
                                      <div className="flex items-center justify-between hover:bg-slate-50 rounded-lg p-1.5 cursor-pointer">
                                        <div 
                                          onClick={() => handleSelectNode('zone', z)}
                                          className={`flex items-center gap-2 text-xs flex-1 ${selectedNode?.type === 'zone' && selectedNode.data.zoneId === z.zoneId ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
                                        >
                                          <span>🧭</span>
                                          <span className="truncate">{z.zoneName}</span>
                                        </div>
                                        <button 
                                          onClick={() => toggleNodeExpand(`z-${z.zoneId}`)}
                                          className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">
                                            {isZExpanded ? 'expand_more' : 'chevron_right'}
                                          </span>
                                        </button>
                                      </div>

                                      {isZExpanded && (
                                        <div className="pl-3 border-l border-slate-100 ml-2 space-y-1">
                                          {z.shelves.map(s => {
                                            const isSExpanded = expandedNodes[`s-${s.shelfId}`] === true;
                                            return (
                                              <div key={s.shelfId} className="space-y-1">
                                                <div className="flex items-center justify-between hover:bg-slate-50 rounded-lg p-1 cursor-pointer">
                                                  <div 
                                                    onClick={() => handleSelectNode('shelf', s)}
                                                    className={`flex items-center gap-1 text-xs flex-1 ${selectedNode?.type === 'shelf' && selectedNode.data.shelfId === s.shelfId ? 'text-amber-700 font-bold' : 'text-slate-500'}`}
                                                  >
                                                    <span>🗄️</span>
                                                    <span>Kệ {s.shelfCode}</span>
                                                  </div>
                                                  <button 
                                                    onClick={() => toggleNodeExpand(`s-${s.shelfId}`)}
                                                    className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                                  >
                                                    <span className="material-symbols-outlined text-[14px]">
                                                      {isSExpanded ? 'expand_more' : 'chevron_right'}
                                                    </span>
                                                  </button>
                                                </div>

                                                {isSExpanded && (
                                                  <div className="pl-3 border-l border-slate-100 ml-2 space-y-0.5">
                                                    {s.bins.map(b => (
                                                      <div 
                                                        key={b.binId}
                                                        onClick={() => handleSelectNode('bin', b)}
                                                        className={`flex items-center justify-between p-1 rounded cursor-pointer text-xs ${selectedNode?.type === 'bin' && selectedNode.data.binId === b.binId ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
                                                      >
                                                        <span className="truncate">📦 {b.binCode.split('-').pop()}</span>
                                                        {b.isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Center Panel: Visual warehouse map & Layout view tabs */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[520px] flex flex-col">
              {/* Tab Navigation header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-5">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl">
                  {(['overview', 'zones', 'bins', 'docks', 'layout2d'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCenterTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${centerTab === tab ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab === 'layout2d' ? '2D Layout' : tab}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">warehouse</span>
                  <span>Active Context: </span>
                  <span className="text-slate-800 font-extrabold">{selectedWarehouse?.warehouseName || 'None'}</span>
                </div>
              </div>

              {!selectedWarehouseId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                  <span className="material-symbols-outlined text-[48px] text-slate-300">holiday_village</span>
                  <p className="mt-2 text-sm font-medium">Please select a Warehouse from the tree.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* OVERVIEW TAB */}
                  {centerTab === 'overview' && selectedWarehouse && (
                    <div className="space-y-6 flex-1">
                      {/* Overview Sub-KPIs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Zones</p>
                          <p className="text-base font-extrabold text-slate-800 mt-1">{selectedWarehouse.zones.length}</p>
                        </div>
                        <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Shelves</p>
                          <p className="text-base font-extrabold text-slate-800 mt-1">
                            {selectedWarehouse.zones.reduce((acc, curr) => acc + curr.shelves.length, 0)}
                          </p>
                        </div>
                        <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bins</p>
                          <p className="text-base font-extrabold text-slate-800 mt-1">
                            {selectedWarehouse.zones.reduce((acc, curr) => acc + curr.shelves.reduce((sAcc, sCurr) => sAcc + sCurr.bins.length, 0), 0)}
                          </p>
                        </div>
                        <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Available Bins</p>
                          <p className="text-base font-extrabold text-emerald-600 mt-1">
                            {selectedWarehouse.zones.reduce((acc, curr) => acc + curr.shelves.reduce((sAcc, sCurr) => sAcc + sCurr.bins.filter(b => !b.isOccupied && b.isActive).length, 0), 0)}
                          </p>
                        </div>
                      </div>

                      {/* Charts and distributions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Warehouse Utilization</h4>
                          <div className="space-y-3">
                            {treeData.map(w => {
                              let total = 0;
                              let occupied = 0;
                              w.zones.forEach(z => z.shelves.forEach(s => s.bins.forEach(b => {
                                total++;
                                if (b.isOccupied) occupied++;
                              })));
                              const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
                              return (
                                <div key={w.warehouseId} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-700">{w.warehouseCode}</span>
                                    <span className="text-slate-500">{rate}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bin Type Distribution</h4>
                          <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-50">
                              <span className="text-slate-500 font-bold">STANDARD</span>
                              <span className="font-extrabold text-slate-700">{kpis.totalBins - kpis.coldBins - kpis.hazmatBins} bins</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50">
                              <span className="text-cyan-600 font-bold">COLD</span>
                              <span className="font-extrabold text-slate-700">{kpis.coldBins} bins</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50">
                              <span className="text-rose-600 font-bold">HAZMAT</span>
                              <span className="font-extrabold text-slate-700">{kpis.hazmatBins} bins</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Zone Overview table */}
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Zone Overview</h4>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                              <th className="pb-2">Zone</th>
                              <th className="pb-2">Type</th>
                              <th className="pb-2 text-center">Shelves</th>
                              <th className="pb-2 text-center">Bins</th>
                              <th className="pb-2 text-center">Used %</th>
                              <th className="pb-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedWarehouse.zones.map(z => {
                              let total = 0;
                              let occupied = 0;
                              z.shelves.forEach(s => s.bins.forEach(b => {
                                total++;
                                if (b.isOccupied) occupied++;
                              }));
                              const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
                              return (
                                <tr key={z.zoneId} className="border-b border-slate-50 text-slate-700 font-medium">
                                  <td className="py-2.5 font-bold">{z.zoneName}</td>
                                  <td className="py-2.5">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                      z.zoneType === 'COLD' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                                      z.zoneType === 'HAZMAT' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                      'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}>{z.zoneType}</span>
                                  </td>
                                  <td className="py-2.5 text-center">{z.shelves.length}</td>
                                  <td className="py-2.5 text-center">{total}</td>
                                  <td className="py-2.5 text-center font-bold">{rate}%</td>
                                  <td className="py-2.5 text-center">
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${z.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ZONES TAB */}
                  {centerTab === 'zones' && selectedWarehouse && (
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Zone Code</th>
                            <th className="pb-3">Zone Name</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Capacity</th>
                            <th className="pb-3 text-center">Shelves</th>
                            <th className="pb-3 text-center">Status</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedWarehouse.zones.map(z => (
                            <tr key={z.zoneId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                              <td className="py-3 font-mono">{z.zoneCode}</td>
                              <td className="py-3 font-bold">{z.zoneName}</td>
                              <td className="py-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  z.zoneType === 'COLD' ? 'bg-cyan-50 text-cyan-600' :
                                  z.zoneType === 'HAZMAT' ? 'bg-rose-50 text-rose-600' :
                                  z.zoneType === 'HEAVY' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                                }`}>{z.zoneType}</span>
                              </td>
                              <td className="py-3">{z.capacity || '-'} Tấn</td>
                              <td className="py-3 text-center">{z.shelves.length}</td>
                              <td className="py-3 text-center">
                                <span className={`w-2 h-2 rounded-full inline-block ${z.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              </td>
                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => handleSelectNode('zone', z)}
                                  className="text-primary-600 font-bold hover:underline"
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* BINS TAB */}
                  {centerTab === 'bins' && selectedWarehouse && (
                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* Filter Bar */}
                      <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Zone:</label>
                            <select
                              value={zoneFilter}
                              onChange={(e) => {
                                setZoneFilter(e.target.value);
                                setShelfFilter('ALL');
                              }}
                              className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold focus:outline-none"
                            >
                              <option value="ALL">All Zones</option>
                              {selectedWarehouse.zones.map(z => (
                                <option key={z.zoneId} value={z.zoneCode}>{z.zoneName}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Shelf:</label>
                            <select
                              value={shelfFilter}
                              onChange={(e) => setShelfFilter(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold focus:outline-none"
                            >
                              <option value="ALL">All Shelves</option>
                              {selectedWarehouse.zones
                                .filter(z => zoneFilter === 'ALL' || z.zoneCode === zoneFilter)
                                .flatMap(z => z.shelves)
                                .map(s => (
                                  <option key={s.shelfId} value={s.shelfCode}>{s.shelfCode}</option>
                                ))
                              }
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Status:</label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold focus:outline-none"
                            >
                              <option value="ALL">All Status</option>
                              <option value="AVAILABLE">Available</option>
                              <option value="OCCUPIED">Occupied</option>
                              <option value="LOCKED">Locked</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Occupied
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Locked
                          </span>
                        </div>
                      </div>

                      {/* Bins Grid */}
                      <div className="flex-1">
                        {gridBins.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-[32px] text-slate-300">inventory</span>
                            <p className="text-xs mt-2">No bins matching selected filters.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
                            {gridBins.map((b: BinTreeDto) => (
                              <div
                                key={b.binId}
                                onClick={() => handleSelectNode('bin', b)}
                                className={`p-3.5 border rounded-2xl cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all text-left flex flex-col justify-between h-[135px] ${
                                  !b.isActive ? 'bg-slate-100 border-slate-200 text-slate-400' :
                                  b.isOccupied ? 'bg-blue-50/30 border-blue-200 text-blue-700' :
                                  'bg-emerald-50/20 border-emerald-200 text-emerald-700'
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono text-xs font-bold">{b.binCode.split('-').pop()}</span>
                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                      !b.isActive ? 'bg-slate-200 text-slate-600' :
                                      b.isOccupied ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {!b.isActive ? 'Locked' : b.isOccupied ? 'Occupied' : 'Available'}
                                    </span>
                                  </div>
                                  <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">{b.binType}</div>
                                  {b.isOccupied && b.mockSku && (
                                    <div className="text-[10px] font-bold text-slate-800 mt-1.5 truncate">SKU: {b.mockSku}</div>
                                  )}
                                </div>
                                <div className="flex justify-between items-baseline text-[9px] font-bold text-slate-400 pt-2 border-t border-slate-100/50">
                                  <span>{b.capacityCbm} CBM</span>
                                  <span>{b.maxWeightKg} kg</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DOCKS TAB */}
                  {centerTab === 'docks' && selectedWarehouse && (
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Dock Code</th>
                            <th className="pb-3">Dock Name</th>
                            <th className="pb-3">Truck Limit</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-center">Active</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedWarehouse.docks.map(d => (
                            <tr key={d.dockId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                              <td className="py-3 font-mono font-bold">{d.dockCode}</td>
                              <td className="py-3">{d.dockName || '-'}</td>
                              <td className="py-3">{d.maxTruckLength || '-'} m</td>
                              <td className="py-3">
                                <select 
                                  value={d.status}
                                  onChange={(e) => handleUpdateDockStatus(d.dockId, e.target.value)}
                                  className={`rounded-lg py-1 px-2 border text-[10px] font-bold ${
                                    d.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-200' :
                                    d.status === 'OCCUPIED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  <option value="AVAILABLE">AVAILABLE</option>
                                  <option value="OCCUPIED">OCCUPIED</option>
                                  <option value="MAINTENANCE">MAINTENANCE</option>
                                </select>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`w-2 h-2 rounded-full inline-block ${d.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              </td>
                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => handleSelectNode('dock', d)}
                                  className="text-[#2563EB] font-bold hover:underline"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2D LAYOUT TAB */}
                  {centerTab === 'layout2d' && selectedWarehouse && (
                    <div className="flex-1 flex flex-col gap-5">
                      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400" />
                        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">
                              <span className="material-symbols-outlined text-[16px]">warehouse</span>
                              2D Warehouse Floor Plan
                            </div>
                            <h3 className="mt-1 text-xl font-black text-slate-900">
                              {activeMap?.mapName || `${selectedWarehouse.warehouseName} layout`}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                              Visualize zones, racks, bins, docks, gates and live occupancy in one structured operation map.
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                              <button
                                onClick={() => setViewMode('operation')}
                                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${viewMode === 'operation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                              >
                                Operation
                              </button>
                              <button
                                onClick={() => setViewMode('setup')}
                                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${viewMode === 'setup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                              >
                                Setup
                              </button>
                            </div>
                            <button
                              onClick={handleAutoGenerate2D}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                            >
                              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                              Auto Generate
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 bg-slate-50/70 p-4 md:grid-cols-4">
                          {[
                            { label: 'Zones', value: layoutStats.zones, icon: 'grid_view', color: 'text-blue-600 bg-blue-50' },
                            { label: 'Bins', value: layoutStats.bins, icon: 'inventory_2', color: 'text-emerald-600 bg-emerald-50' },
                            { label: 'Docks', value: layoutStats.docks, icon: 'local_shipping', color: 'text-indigo-600 bg-indigo-50' },
                            { label: 'Active / Busy', value: layoutStats.occupied, icon: 'monitoring', color: 'text-rose-600 bg-rose-50' },
                          ].map(item => (
                            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                              <span className={`material-symbols-outlined rounded-xl p-2 text-[20px] ${item.color}`}>{item.icon}</span>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                                <p className="text-xl font-black text-slate-900">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {[
                              ['#DCFCE7', '#16A34A', 'Available'],
                              ['#DBEAFE', '#2563EB', 'Occupied'],
                              ['#FEF3C7', '#F59E0B', 'Maintenance'],
                              ['#F8FAFC', '#CBD5E1', 'Aisle'],
                              ['#E0E7FF', '#4F46E5', 'Gate'],
                            ].map(([fill, stroke, label]) => (
                              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: fill, borderColor: stroke }} />
                                {label}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] font-bold text-slate-400">
                            Canvas {layoutCanvasWidth} x {layoutCanvasHeight} · {viewMode === 'setup' ? 'Drag objects to adjust layout' : 'Click objects to inspect details'}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-3 shadow-inner">
                        {!activeMap || layoutObjects.length === 0 ? (
                          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
                            <span className="material-symbols-outlined rounded-3xl bg-blue-50 p-5 text-[48px] text-blue-600">map</span>
                            <h3 className="mt-4 text-lg font-black text-slate-900">No 2D layout yet</h3>
                            <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
                              Generate a structured warehouse map from current zones, bins and docks.
                            </p>
                            <button
                              onClick={handleAutoGenerate2D}
                              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                            >
                              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                              Generate Layout
                            </button>
                          </div>
                        ) : (
                          <div className="max-h-[680px] overflow-auto rounded-2xl bg-white p-3">
                            <svg
                              viewBox={`0 0 ${layoutCanvasWidth} ${layoutCanvasHeight}`}
                              className="min-w-[860px] select-none rounded-2xl border border-slate-200 bg-white shadow-sm"
                              style={{ width: '100%', height: 'auto', aspectRatio: `${layoutCanvasWidth} / ${layoutCanvasHeight}` }}
                              onMouseMove={handleObjectDragMove}
                              onMouseUp={handleObjectDragEnd}
                              onMouseLeave={handleObjectDragEnd}
                            >
                              <defs>
                                <pattern id="layoutSmallGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#EEF2F7" strokeWidth="1" />
                                </pattern>
                                <pattern id="layoutLargeGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                                  <rect width="120" height="120" fill="url(#layoutSmallGrid)" />
                                  <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#DDE6F3" strokeWidth="1.2" />
                                </pattern>
                                <filter id="layoutSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.12" />
                                </filter>
                                <filter id="layoutTinyShadow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.10" />
                                </filter>
                                <filter id="layoutZoneShadow" x="-10%" y="-10%" width="120%" height="120%">
                                  <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#2563EB" floodOpacity="0.08" />
                                </filter>
                              </defs>
                              <rect width={layoutCanvasWidth} height={layoutCanvasHeight} fill="#F8FAFC" />
                              <rect x="0" y="0" width={layoutCanvasWidth} height={layoutCanvasHeight} fill="url(#layoutLargeGrid)" />
                              <rect x="18" y="18" width={layoutCanvasWidth - 36} height={layoutCanvasHeight - 36} rx="30" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="14 10" />
                              <text x="42" y="56" fontSize="16" fontWeight="900" fill="#0F172A">{selectedWarehouse.warehouseName}</text>
                              <text x="42" y="78" fontSize="11" fontWeight="800" fill="#64748B">Live warehouse topology · zones · bins · docks</text>
                              {layoutObjectsOrdered.map(renderLayoutObject)}
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}                </div>
              )}
            </div>

            {/* 3. Right Panel: Detail Inspector & Operations Forms */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[420px]">
                
                {/* VIEW ACTION */}
                {action === 'view' && selectedNode && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase">
                          {selectedNode.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${selectedNode.data.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {selectedNode.data.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-slate-800 mt-2 truncate">
                        {selectedNode.type === 'warehouse' && selectedNode.data.warehouseName}
                        {selectedNode.type === 'zone' && selectedNode.data.zoneName}
                        {selectedNode.type === 'shelf' && `Kệ ${selectedNode.data.shelfCode}`}
                        {selectedNode.type === 'bin' && `Bin ${selectedNode.data.binCode.split('-').pop()}`}
                        {selectedNode.type === 'dock' && (selectedNode.data.dockName || `Dock ${selectedNode.data.dockCode}`)}
                      </h3>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {selectedNode.type === 'warehouse' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã kho:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.warehouseCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Diện tích:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.totalCapacity || 0} m²</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400">Địa chỉ:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.address || 'Chưa thiết lập'}</span>
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'zone' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã khu vực:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.zoneCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Loại bảo quản:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.zoneType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sức chứa:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.capacity || 0} Tấn</span>
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'shelf' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã kệ:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.shelfCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tầng kệ:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.floorLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tải trọng tối đa:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.maxWeightKg || 0} kg</span>
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'bin' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã ô chứa:</span>
                            <span className="font-bold text-slate-700 font-mono">{selectedNode.data.binCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Loại ô chứa:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.binType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Thể tích:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.capacityCbm || 0} m³</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Trọng tải:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.maxWeightKg || 0} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Trạng thái:</span>
                            <span className={`font-bold ${selectedNode.data.isOccupied ? 'text-blue-600' : 'text-emerald-600'}`}>
                              {selectedNode.data.isOccupied ? 'Occupied' : 'Available'}
                            </span>
                          </div>

                          {/* Render inventory details if occupied */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Current Inventory</p>
                            {selectedNode.data.isOccupied ? (
                              <div className="space-y-1.5 text-slate-700">
                                <div><span className="text-slate-400">SKU:</span> <span className="font-bold">{selectedNode.data.mockSku}</span></div>
                                <div><span className="text-slate-400">Product:</span> <span className="font-bold">{selectedNode.data.mockProduct}</span></div>
                                <div><span className="text-slate-400">Quantity:</span> <span className="font-bold text-blue-600">{selectedNode.data.mockQty}</span></div>
                                <div><span className="text-slate-400">Batch:</span> <span className="font-bold">{selectedNode.data.mockBatch}</span></div>
                                <div><span className="text-slate-400">Expiry:</span> <span className="font-bold">{selectedNode.data.mockExpiry}</span></div>
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">No item in this bin</p>
                            )}
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'dock' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mã dock:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.dockCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Chiều dài xe tối đa:</span>
                            <span className="font-bold text-slate-700">{selectedNode.data.maxTruckLength || 0} m</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex gap-2">
                        {selectedNode.type === 'bin' && selectedNode.data.isOccupied ? (
                          <>
                            <button 
                              onClick={() => triggerSuccess('Đang mở chi tiết tồn kho...')}
                              className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
                            >
                              View Inv
                            </button>
                            <button 
                              onClick={() => triggerSuccess('Đã khởi tạo lệnh chuyển kho...')}
                              className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
                            >
                              Transfer
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={prepareEdit}
                              className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              Sửa
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(selectedNode.type, selectedNode.type === 'warehouse' ? selectedNode.data.warehouseId : selectedNode.type === 'zone' ? selectedNode.data.zoneId : selectedNode.type === 'shelf' ? selectedNode.data.shelfId : selectedNode.type === 'bin' ? selectedNode.data.binId : selectedNode.data.dockId, selectedNode.data.isActive)}
                              className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                selectedNode.data.isActive ? 'border-rose-100 text-rose-600 hover:bg-rose-50' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {selectedNode.data.isActive ? 'block' : 'check_circle'}
                              </span>
                              {selectedNode.data.isActive ? 'Khóa' : 'Kích hoạt'}
                            </button>
                          </>
                        )}
                      </div>

                      <button 
                        onClick={() => triggerSuccess('Đang chuẩn bị in nhãn mã vạch QR...')}
                        className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        Print QR Label
                      </button>

                      {/* Add Children Buttons contextual */}
                      {selectedNode.type === 'warehouse' && (
                        <button 
                          onClick={() => {
                            setDockForm({ dockCode: '', dockName: '', status: 'AVAILABLE', maxTruckLength: '' });
                            setAction('add_dock');
                          }}
                          className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                          + Dock bốc xếp
                        </button>
                      )}

                      {selectedNode.type === 'zone' && (
                        <button 
                          onClick={() => {
                            setShelfForm({ shelfCode: '', floorLevel: '1', maxWeightKg: '' });
                            setAction('add_shelf');
                          }}
                          className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">table_bar</span>
                          + Kệ / Dãy (Shelf)
                        </button>
                      )}

                      {selectedNode.type === 'shelf' && (
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => {
                              setBinForm({ binCode: '', binType: 'STANDARD', capacityCbm: '10', maxWeightKg: '2000' });
                              setAction('add_bin');
                            }}
                            className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_box</span>
                            + Ô chứa (Bin)
                          </button>
                          <button 
                            onClick={() => setShowBulkModal(true)}
                            className="w-full py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">dynamic_feed</span>
                            Bulk Create Bins
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CREATE WAREHOUSE FORM */}
                {action === 'add_warehouse' && (
                  <form onSubmit={handleCreateWarehouse} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🏢 Add Warehouse</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Mã kho (Unique) *</label>
                        <input 
                          type="text" required value={warehouseForm.warehouseCode}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouseCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. WH001"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên kho *</label>
                        <input 
                          type="text" required value={warehouseForm.warehouseName}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouseName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. Kho Tân Bình"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Sức chứa (m²)</label>
                        <input 
                          type="number" value={warehouseForm.totalCapacity}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, totalCapacity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Địa chỉ</label>
                        <input 
                          type="text" value={warehouseForm.address}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="Địa chỉ cụ thể..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Tạo</button>
                    </div>
                  </form>
                )}

                {/* EDIT WAREHOUSE FORM */}
                {action === 'edit_warehouse' && (
                  <form onSubmit={handleUpdateWarehouse} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🏢 Edit Warehouse</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Mã kho (Cố định)</label>
                        <input type="text" disabled value={warehouseForm.warehouseCode} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs text-slate-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên kho *</label>
                        <input 
                          type="text" required value={warehouseForm.warehouseName}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouseName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Sức chứa (m²)</label>
                        <input 
                          type="number" value={warehouseForm.totalCapacity}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, totalCapacity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Địa chỉ</label>
                        <input 
                          type="text" value={warehouseForm.address}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                )}

                {/* CREATE ZONE FORM */}
                {action === 'add_zone' && (
                  <form onSubmit={handleCreateZone} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🧭 Add Zone</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Mã khu vực (ZoneCode) *</label>
                        <input 
                          type="text" required value={zoneForm.zoneCode}
                          onChange={(e) => setZoneForm({ ...zoneForm, zoneCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. WH001-A"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên khu vực *</label>
                        <input 
                          type="text" required value={zoneForm.zoneName}
                          onChange={(e) => setZoneForm({ ...zoneForm, zoneName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. Khu A - Hàng thường"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Loại sản phẩm bảo quản</label>
                        <select 
                          value={zoneForm.zoneType}
                          onChange={(e) => setZoneForm({ ...zoneForm, zoneType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="COLD">COLD</option>
                          <option value="HAZMAT">HAZMAT</option>
                          <option value="HEAVY">HEAVY</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Sức chứa tối đa (Tấn)</label>
                        <input 
                          type="number" value={zoneForm.capacity}
                          onChange={(e) => setZoneForm({ ...zoneForm, capacity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="2000"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Tạo</button>
                    </div>
                  </form>
                )}

                {/* EDIT ZONE FORM */}
                {action === 'edit_zone' && (
                  <form onSubmit={handleUpdateZone} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🧭 Edit Zone</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Mã khu vực (Cố định)</label>
                        <input type="text" disabled value={zoneForm.zoneCode} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs text-slate-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên khu vực *</label>
                        <input 
                          type="text" required value={zoneForm.zoneName}
                          onChange={(e) => setZoneForm({ ...zoneForm, zoneName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Loại bảo quản</label>
                        <select 
                          value={zoneForm.zoneType}
                          onChange={(e) => setZoneForm({ ...zoneForm, zoneType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="NORMAL">NORMAL</option>
                          <option value="COLD">COLD</option>
                          <option value="HAZMAT">HAZMAT</option>
                          <option value="HEAVY">HEAVY</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Sức chứa tối đa (Tấn)</label>
                        <input 
                          type="number" value={zoneForm.capacity}
                          onChange={(e) => setZoneForm({ ...zoneForm, capacity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                )}

                {/* CREATE SHELF FORM */}
                {action === 'add_shelf' && (
                  <form onSubmit={handleCreateShelf} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🗄️ Add Shelf</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Mã kệ (ShelfCode) *</label>
                        <input 
                          type="text" required value={shelfForm.shelfCode}
                          onChange={(e) => setShelfForm({ ...shelfForm, shelfCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. R01-L1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tầng kệ *</label>
                        <input 
                          type="number" required min="1" value={shelfForm.floorLevel}
                          onChange={(e) => setShelfForm({ ...shelfForm, floorLevel: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tải trọng (kg)</label>
                        <input 
                          type="number" value={shelfForm.maxWeightKg}
                          onChange={(e) => setShelfForm({ ...shelfForm, maxWeightKg: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="3000"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Tạo</button>
                    </div>
                  </form>
                )}

                {/* EDIT SHELF FORM */}
                {action === 'edit_shelf' && (
                  <form onSubmit={handleUpdateShelf} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🗄️ Edit Shelf</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Mã kệ (Cố định)</label>
                        <input type="text" disabled value={shelfForm.shelfCode} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs text-slate-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tầng kệ *</label>
                        <input 
                          type="number" required min="1" value={shelfForm.floorLevel}
                          onChange={(e) => setShelfForm({ ...shelfForm, floorLevel: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tải trọng (kg)</label>
                        <input 
                          type="number" value={shelfForm.maxWeightKg}
                          onChange={(e) => setShelfForm({ ...shelfForm, maxWeightKg: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                )}

                {/* CREATE BIN FORM */}
                {action === 'add_bin' && (
                  <form onSubmit={validateAndSubmitCreateBin} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">📦 Add Bin</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Mã ô chứa *</label>
                          <button 
                            type="button" 
                            onClick={handleAutoGenerateBinCode}
                            className="text-[9px] text-[#2563EB] hover:underline font-bold"
                          >
                            Auto Generate
                          </button>
                        </div>
                        <input 
                          type="text" required value={binForm.binCode}
                          onChange={(e) => setBinForm({ ...binForm, binCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. WH001-A-R01-L1-B01"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Loại ô chứa</label>
                        <select 
                          value={binForm.binType}
                          onChange={(e) => setBinForm({ ...binForm, binType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="STANDARD">STANDARD</option>
                          <option value="COLD">COLD</option>
                          <option value="HAZMAT">HAZMAT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Thể tích (m³ - CBM)</label>
                        <input 
                          type="number" step="0.1" value={binForm.capacityCbm}
                          onChange={(e) => setBinForm({ ...binForm, capacityCbm: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tải trọng (kg)</label>
                        <input 
                          type="number" value={binForm.maxWeightKg}
                          onChange={(e) => setBinForm({ ...binForm, maxWeightKg: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Tạo</button>
                    </div>
                  </form>
                )}

                {/* EDIT BIN FORM */}
                {action === 'edit_bin' && (
                  <form onSubmit={validateAndSubmitUpdateBin} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">📦 Edit Bin</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Mã ô chứa (Cố định)</label>
                        <input type="text" disabled value={binForm.binCode} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs text-slate-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Loại ô chứa</label>
                        <select 
                          value={binForm.binType}
                          onChange={(e) => setBinForm({ ...binForm, binType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="STANDARD">STANDARD</option>
                          <option value="COLD">COLD</option>
                          <option value="HAZMAT">HAZMAT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Thể tích (m³ - CBM)</label>
                        <input 
                          type="number" step="0.1" value={binForm.capacityCbm}
                          onChange={(e) => setBinForm({ ...binForm, capacityCbm: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tải trọng (kg)</label>
                        <input 
                          type="number" value={binForm.maxWeightKg}
                          onChange={(e) => setBinForm({ ...binForm, maxWeightKg: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                )}

                {/* CREATE DOCK FORM */}
                {action === 'add_dock' && (
                  <form onSubmit={handleCreateDock} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🚚 Add Dock</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Mã Dock *</label>
                        <input 
                          type="text" required value={dockForm.dockCode}
                          onChange={(e) => setDockForm({ ...dockForm, dockCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. D01"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên Dock</label>
                        <input 
                          type="text" value={dockForm.dockName}
                          onChange={(e) => setDockForm({ ...dockForm, dockName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="e.g. Cửa nhập 01"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Trạng thái khởi tạo</label>
                        <select 
                          value={dockForm.status}
                          onChange={(e) => setDockForm({ ...dockForm, status: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OCCUPIED">OCCUPIED</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Chiều dài xe tải tối đa (m)</label>
                        <input 
                          type="number" step="0.1" value={dockForm.maxTruckLength}
                          onChange={(e) => setDockForm({ ...dockForm, maxTruckLength: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          placeholder="16.5"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Tạo</button>
                    </div>
                  </form>
                )}

                {/* EDIT DOCK FORM */}
                {action === 'edit_dock' && (
                  <form onSubmit={handleUpdateDock} className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">🚚 Edit Dock</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Mã Dock (Cố định)</label>
                        <input type="text" disabled value={dockForm.dockCode} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs text-slate-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Tên Dock</label>
                        <input 
                          type="text" value={dockForm.dockName}
                          onChange={(e) => setDockForm({ ...dockForm, dockName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Trạng thái</label>
                        <select 
                          value={dockForm.status}
                          onChange={(e) => setDockForm({ ...dockForm, status: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OCCUPIED">OCCUPIED</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Chiều dài xe tải tối đa (m)</label>
                        <input 
                          type="number" step="0.1" value={dockForm.maxTruckLength}
                          onChange={(e) => setDockForm({ ...dockForm, maxTruckLength: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setAction('view')} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50">Hủy</button>
                      <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* BULK BIN GENERATION MODAL */}
      {showBulkModal && selectedNode && selectedNode.type === 'shelf' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-amber-500">dynamic_feed</span>
                Bulk Generate Bins
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleBulkGenerateBins} className="p-6 space-y-4">
              <div className="text-xs text-slate-400 font-bold bg-amber-50 border border-amber-100 p-3 rounded-xl">
                Kệ đích: Kệ {selectedNode.data.shelfCode} <br/>
                Khu vực: {findZoneById(selectedNode.data.zoneId)?.zoneName}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Mã Prefix ô chứa *</label>
                  <input 
                    type="text" required value={bulkBinForm.prefix}
                    onChange={(e) => setBulkBinForm({ ...bulkBinForm, prefix: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Số bắt đầu *</label>
                  <input 
                    type="number" required min="0" value={bulkBinForm.startNumber}
                    onChange={(e) => setBulkBinForm({ ...bulkBinForm, startNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Số kết thúc *</label>
                  <input 
                    type="number" required min="1" value={bulkBinForm.endNumber}
                    onChange={(e) => setBulkBinForm({ ...bulkBinForm, endNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Loại ô chứa</label>
                  <select 
                    value={bulkBinForm.binType}
                    onChange={(e) => setBulkBinForm({ ...bulkBinForm, binType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="COLD">COLD</option>
                    <option value="HAZMAT">HAZMAT</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Thể tích (CBM)</label>
                  <input 
                    type="number" step="0.1" value={bulkBinForm.capacityCbm}
                    onChange={(e) => setBulkBinForm({ ...bulkBinForm, capacityCbm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Tải trọng tối đa (kg)</label>
                  <input 
                    type="number" value={bulkBinForm.maxWeightKg}
                    onChange={(e) => setBulkBinForm({ ...bulkBinForm, maxWeightKg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
                Xem trước mã: {bulkBinForm.prefix}{parseInt(bulkBinForm.startNumber) < 10 ? `0${bulkBinForm.startNumber}` : bulkBinForm.startNumber} đến {bulkBinForm.prefix}{parseInt(bulkBinForm.endNumber) < 10 ? `0${bulkBinForm.endNumber}` : bulkBinForm.endNumber}
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowBulkModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Generate Bins</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOCK MISMISTCH WARNING MODAL */}
      {showMismatchModal && pendingBinAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center text-amber-800">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                Warning: Type Mismatch
              </h3>
              <button onClick={() => setShowMismatchModal(false)} className="text-amber-500 hover:text-amber-800">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Loại ô chứa <strong>{pendingBinAction.binType}</strong> không tương thích với loại khu vực của kệ cha 
                (<strong>{findZoneById(findShelfById(pendingBinAction.shelfId)?.zoneId || 0)?.zoneType}</strong>).
              </p>
              <p className="text-xs text-slate-600 font-bold">
                Hệ thống khuyên dùng loại ô chứa trùng khớp để đảm bảo gợi ý AI và đối soát hoạt động chính xác.
              </p>
              
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => handleMismatchModalResolve('correct')}
                  className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                >
                  Đổi sang loại khớp khu vực (Khuyên dùng)
                </button>
                <button 
                  onClick={() => handleMismatchModalResolve('keep')}
                  className="w-full py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Vẫn giữ nguyên loại đã chọn
                </button>
                <button 
                  onClick={() => {
                    setShowMismatchModal(false);
                    setPendingBinAction(null);
                  }}
                  className="w-full py-2 text-slate-400 text-xs font-bold hover:underline"
                >
                  Hủy thao tác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATE BLOCK / ACTIVE STOCK WARNING MODAL */}
      {showDeactivateBlockModal && deactivateBlockInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center text-rose-800">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Cannot Disable Location
              </h3>
              <button onClick={() => setShowDeactivateBlockModal(false)} className="text-rose-500 hover:text-rose-800">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Vị trí <strong>{deactivateBlockInfo.name}</strong> hiện tại vẫn còn chứa hàng hóa đang lưu kho. 
                  Bạn không thể tắt hoạt động cho đến khi vị trí này hoàn toàn trống.
                </p>
                <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl space-y-1 mt-2">
                  <div><span className="text-slate-400">SKU:</span> <span className="font-bold text-slate-800">{deactivateBlockInfo.sku}</span></div>
                  <div><span className="text-slate-400">Số lượng tồn:</span> <span className="font-bold text-rose-600">{deactivateBlockInfo.qty}</span></div>
                </div>
                <p className="font-bold text-slate-700 mt-2">
                  Vui lòng di chuyển toàn bộ hàng tồn kho sang vị trí ô chứa khác trước khi thực hiện vô hiệu hóa.
                </p>
              </div>
              
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setShowDeactivateBlockModal(false);
                    triggerSuccess('Chuyển hướng đến tạo lệnh chuyển kho...');
                  }} 
                  className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                >
                  Tạo lệnh chuyển kho (Transfer)
                </button>
                <button 
                  onClick={() => setShowDeactivateBlockModal(false)} 
                  className="px-3 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWarehouses;
