import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

// Maps numeric RoleID -> RoleCode used by the backend.
// RoleID = 1 -> Admin, RoleID = 2 -> Warehouse
const ROLE_ID_TO_CODE: Record<string, string> = {
  '1': 'ADMIN',
  '2': 'WAREHOUSE',
};

interface StoredUser {
  name?: string;
  email?: string;
  role?: string | number;
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

// Normalises whatever is stored (RoleCode string or numeric RoleID) into an
// upper-case role code so guards can compare consistently.
function normaliseRole(role: string | number | undefined): string {
  if (role === undefined || role === null) return '';
  const value = String(role).trim();
  if (ROLE_ID_TO_CODE[value]) return ROLE_ID_TO_CODE[value];
  return value.toUpperCase();
}

function isRoleAllowed(role: string | number | undefined, allow: string[]): boolean {
  const current = normaliseRole(role);
  if (!current) return false;
  return allow.some((allowed) => {
    const target = allowed.toUpperCase();
    // Match exact code or codes that contain the keyword (e.g. WAREHOUSE_STAFF).
    return current === target || current.includes(target);
  });
}

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] px-6">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-slate-200">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-600 text-[34px]">block</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-sm text-slate-500 mb-6">
          Bạn không có quyền truy cập vào trang này. Chỉ tài khoản Quản trị viên (Admin) và Kho
          (Warehouse) mới được phép truy cập các trang quản lý kho.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-lg text-white font-semibold transition-colors"
          style={{ background: 'linear-gradient(135deg, #004ac6 0%, #005e6e 100%)' }}
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

interface RoleGuardProps {
  allow: string[];
  children: React.ReactNode;
}

// Restricts a route to the given role codes. Logged-out users are sent to the
// login page; logged-in users without an allowed role see an access-denied screen.
const RoleGuard: React.FC<RoleGuardProps> = ({ allow, children }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isRoleAllowed(user.role, allow)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

export default RoleGuard;
