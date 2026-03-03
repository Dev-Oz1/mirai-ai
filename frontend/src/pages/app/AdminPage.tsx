import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Shield, Users, Briefcase, FileText, File, Activity, Search } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

type AdminSummary = {
  users_count: number;
  jobs_count: number;
  cover_letters_count: number;
  resumes_count: number;
  sessions_last_24h: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  data_sharing_consent?: boolean;
  latest_login_at?: string | null;
  latest_login_ip?: string | null;
  latest_login_ip_scope?: string;
  latest_auth_provider?: string | null;
  is_currently_logged_in?: boolean;
  is_currently_online?: boolean;
  last_seen_at?: string | null;
};

type AdminUserSession = {
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  auth_provider: string;
};

type AdminAuditLog = {
  id: number;
  admin_username: string;
  action: string;
  target_user_id?: number | null;
  target_user_email?: string | null;
  request_ip?: string | null;
  user_agent?: string | null;
  details?: string | null;
  created_at: string;
};

export function AdminPage() {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<AdminUserSession[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [forcingLogoutUserId, setForcingLogoutUserId] = useState<number | null>(null);
  const [isForcingLogoutAll, setIsForcingLogoutAll] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const shortUserAgent = (ua?: string | null) => {
    if (!ua) return 'Unknown device/browser';
    if (ua.length <= 90) return ua;
    return `${ua.slice(0, 87)}...`;
  };

  const refreshData = async (query = search) => {
    setIsLoading(true);
    setError('');
    try {
      const [summaryData, usersData] = await Promise.all([
        adminAPI.getSummary(),
        adminAPI.getUsers({ search: query || undefined, limit: 100, offset: 0 }),
      ]);
      const auditData = await adminAPI.getAuditLogs({ limit: 20 });

      setSummary(summaryData);
      setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      setTotalUsers(usersData?.total_users ?? 0);
      setActiveUsers(usersData?.active_users ?? 0);
      setAuditLogs(Array.isArray(auditData?.logs) ? auditData.logs : []);
      setAuditTotal(auditData?.total_logs ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSessions = async (user: AdminUser) => {
    setSelectedUser(user);
    setIsSessionsLoading(true);
    setSessionError('');
    try {
      const data = await adminAPI.getUserSessions(user.id, 30);
      setSelectedUserSessions(Array.isArray(data?.sessions) ? data.sessions : []);
    } catch (err: any) {
      setSessionError(err?.response?.data?.detail || 'Failed to load user sessions.');
      setSelectedUserSessions([]);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Delete user "${user.name}" (${user.email})? This action is permanent.`
    );
    if (!confirmed) return;

    setDeletingUserId(user.id);
    try {
      await adminAPI.deleteUser(user.id);
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        setSelectedUserSessions([]);
      }
      await refreshData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleForceLogoutUser = async (user: AdminUser) => {
    const confirmed = window.confirm(`Force logout "${user.name}" (${user.email}) now?`);
    if (!confirmed) return;

    setForcingLogoutUserId(user.id);
    try {
      await adminAPI.forceLogoutUser(user.id);
      await refreshData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to force logout user.');
    } finally {
      setForcingLogoutUserId(null);
    }
  };

  const handleForceLogoutAllUsers = async () => {
    const confirmed = window.confirm(
      'Force logout ALL users now? Everyone will need to sign in again.'
    );
    if (!confirmed) return;

    setIsForcingLogoutAll(true);
    try {
      await adminAPI.forceLogoutAllUsers();
      await refreshData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to force logout all users.');
    } finally {
      setIsForcingLogoutAll(false);
    }
  };

  const cards = useMemo(
    () => [
      { label: 'Users', value: summary?.users_count ?? 0, icon: Users },
      { label: 'Jobs', value: summary?.jobs_count ?? 0, icon: Briefcase },
      { label: 'Cover Letters', value: summary?.cover_letters_count ?? 0, icon: FileText },
      { label: 'Resumes', value: summary?.resumes_count ?? 0, icon: File },
      { label: 'Sessions (24h)', value: summary?.sessions_last_24h ?? 0, icon: Activity },
    ],
    [summary]
  );

  const formatAction = (action: string) => action.replace(/_/g, ' ');

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
            <p className="text-sm text-gray-600">Restricted environment</p>
          </div>
          <Button variant="danger" onClick={handleAdminLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Admin Overview</h2>
          </div>
          <p className="text-sm text-gray-600">
            Manage registered users, inspect sessions/IP activity, and remove accounts when needed.
          </p>
        </section>

        {isLoading && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Loading admin data...</p>
          </section>
        )}

        {!isLoading && error && (
          <section className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </section>
        )}

        {!isLoading && !error && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {cards.map((card) => (
                <div key={card.label} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{card.label}</span>
                    <card.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">
                    Total: {totalUsers} | Online now: {activeUsers}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    isLoading={isForcingLogoutAll}
                    onClick={handleForceLogoutAllUsers}
                  >
                    Log Out All Users
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search name or email"
                      className="pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <Button
                    variant="tech-gradient"
                    onClick={() => {
                      setSearch(searchInput.trim());
                      refreshData(searchInput.trim());
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>

              {users.length === 0 ? (
                <p className="text-sm text-gray-600">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="py-2 pr-4 font-semibold text-gray-700">User</th>
                        <th className="py-2 pr-4 font-semibold text-gray-700">Latest Session</th>
                        <th className="py-2 pr-4 font-semibold text-gray-700">IP</th>
                        <th className="py-2 pr-4 font-semibold text-gray-700">Status</th>
                        <th className="py-2 pr-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-gray-600">{u.email}</p>
                            <p className="text-xs text-gray-500">Joined {formatDateTime(u.created_at)}</p>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">
                            <p>{formatDateTime(u.latest_login_at)}</p>
                            <p className="text-xs capitalize">{u.latest_auth_provider || 'none'} auth</p>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">
                            <p>{u.latest_login_ip || 'Unknown'}</p>
                            <p className="text-xs capitalize">{u.latest_login_ip_scope || 'unknown'}</p>
                          </td>
                          <td className="py-3 pr-4">
                            {u.is_currently_online ? (
                              <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                Active
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                Offline
                              </span>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Last seen: {formatDateTime(u.last_seen_at)}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-2">
                              <Button variant="secondary" onClick={() => loadSessions(u)}>
                                Sessions
                              </Button>
                              <Button
                                variant="secondary"
                                isLoading={forcingLogoutUserId === u.id}
                                onClick={() => handleForceLogoutUser(u)}
                              >
                                Log Out
                              </Button>
                              <Button
                                variant="danger"
                                isLoading={deletingUserId === u.id}
                                onClick={() => handleDeleteUser(u)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">Selected User Session Log</h3>
              {!selectedUser && <p className="text-sm text-gray-600">Select a user and click Sessions.</p>}

              {selectedUser && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>

                  {isSessionsLoading && <p className="text-sm text-gray-600">Loading session history...</p>}
                  {sessionError && <p className="text-sm text-red-700">{sessionError}</p>}

                  {!isSessionsLoading && !sessionError && (
                    <>
                      {selectedUserSessions.length === 0 ? (
                        <p className="text-sm text-gray-600">No session records found.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedUserSessions.map((s, idx) => (
                            <div key={`${s.created_at}-${idx}`} className="rounded-lg bg-gray-50 p-3 text-sm">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="font-medium text-gray-900 capitalize">{s.auth_provider} login</span>
                                <span className="text-gray-500">{formatDateTime(s.created_at)}</span>
                              </div>
                              <p className="mt-1 text-gray-700">
                                IP: {s.ip_address || 'Unknown'} | Device: {shortUserAgent(s.user_agent)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">Admin Audit Logs</h3>
                <p className="text-xs text-gray-500">Showing latest {auditLogs.length} of {auditTotal}</p>
              </div>

              {auditLogs.length === 0 ? (
                <p className="text-sm text-gray-600">No audit logs yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-medium text-gray-900 capitalize">{formatAction(log.action)}</span>
                        <span className="text-gray-500">{formatDateTime(log.created_at)}</span>
                      </div>
                      <p className="mt-1 text-gray-700">
                        Admin: {log.admin_username}
                        {log.target_user_email ? ` | Target: ${log.target_user_email}` : ''}
                        {log.request_ip ? ` | IP: ${log.request_ip}` : ''}
                      </p>
                      {log.details && <p className="mt-1 text-xs text-gray-600">{log.details}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
