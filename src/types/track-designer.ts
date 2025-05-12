// 边界点结构
export interface BoundaryPoint {
  lat: number;
  lng: number;
  height: number;
}

// 边界数据结构
export interface BoundaryData {
  paths: BoundaryPoint[];
  styleId: string;
  rank: number;
  id: string;
}

// 路径点结构
export interface PathPoint {
  lat: number;
  lng: number;
  sortNum: number;
}

// 地图边界结构
export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// 警告类型
export type AlertType = 'success' | 'danger' | 'warning' | 'info';

// 工具函数：生成UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
  });
};

// 工具函数：显示警告信息
export const showAlert = (message: string, type: AlertType = 'info'): void => {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
};
