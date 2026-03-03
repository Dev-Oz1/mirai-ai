import { useEffect, useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../AuthContext';
import { settingsAPI } from '../../services/api';
import { User, KeyRound, Server, AlertTriangle } from 'lucide-react';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [profileName, setProfileName] = useState(user?.name || '');
  const [dataSharing, setDataSharing] = useState(!!user?.data_sharing_consent);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const [sessionInfo, setSessionInfo] = useState<{
    current_ip?: string | null;
    current_ip_scope?: string;
    current_user_agent?: string | null;
    recent_sessions: Array<{
      created_at: string;
      ip_address?: string | null;
      user_agent?: string | null;
      auth_provider: string;
    }>;
  }>({ recent_sessions: [] });
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    const fetchSessionInfo = async () => {
      setIsSessionLoading(true);
      setSessionError('');
      try {
        const data = await settingsAPI.getSessionInfo();
        setSessionInfo({
          current_ip: data?.current_ip ?? null,
          current_ip_scope: data?.current_ip_scope ?? 'unknown',
          current_user_agent: data?.current_user_agent ?? null,
          recent_sessions: Array.isArray(data?.recent_sessions) ? data.recent_sessions : [],
        });
      } catch (err: any) {
        setSessionError(err?.response?.data?.detail || 'Failed to load session information.');
      } finally {
        setIsSessionLoading(false);
      }
    };

    fetchSessionInfo();
  }, []);

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const shortUserAgent = (ua?: string | null) => {
    if (!ua) return 'Unknown device/browser';
    if (ua.length <= 70) return ua;
    return `${ua.slice(0, 67)}...`;
  };

  const handleSaveProfile = async () => {
    setProfileMessage('');
    setIsSavingProfile(true);
    try {
      const updated = await settingsAPI.updateProfile({
        name: profileName,
        data_sharing_consent: dataSharing,
      });
      updateUser(updated);
      setProfileMessage('Profile settings updated.');
    } catch (err: any) {
      setProfileMessage(err?.response?.data?.detail || 'Failed to update profile settings.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordMessage('');
    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await settingsAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (err: any) {
      setPasswordMessage(err?.response?.data?.detail || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    logout();
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    setDeleteMessage('');
    if (deleteConfirm !== 'DELETE MY ACCOUNT') {
      setDeleteMessage('You must type DELETE MY ACCOUNT exactly to continue.');
      return;
    }

    setIsDeleting(true);
    try {
      const payload: { confirmation_text: string; current_password?: string } = {
        confirmation_text: deleteConfirm,
      };
      if (deletePassword.trim()) {
        payload.current_password = deletePassword;
      }

      await settingsAPI.deleteAccount(payload);
      localStorage.removeItem('token');
      logout();
      window.location.href = '/signup';
    } catch (err: any) {
      setDeleteMessage(err?.response?.data?.detail || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout title="Settings" actions={<div />}>
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your full name"
            />
            <Input label="Email" value={user?.email || ''} onChange={() => {}} disabled />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">Data sharing consent</p>
              <p className="text-sm text-gray-600">Allow anonymized usage data to improve recommendations.</p>
            </div>
            <button
              type="button"
              onClick={() => setDataSharing(!dataSharing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dataSharing ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle data sharing"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button variant="tech-gradient" onClick={handleSaveProfile} isLoading={isSavingProfile}>
              Save Profile Settings
            </Button>
            {profileMessage && <span className="text-sm text-gray-700">{profileMessage}</span>}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Security</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button variant="tech-gradient" onClick={handleSavePassword} isLoading={isSavingPassword}>
              Update Password
            </Button>
            {passwordMessage && <span className="text-sm text-gray-700">{passwordMessage}</span>}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Session Activity</h2>
          </div>

          {isSessionLoading ? (
            <p className="text-sm text-gray-600">Loading session details...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="font-medium text-gray-900 mb-1">Current IP</p>
                  <p className="text-gray-700 break-all">{sessionInfo.current_ip || 'Unknown'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="font-medium text-gray-900 mb-1">Connection Scope</p>
                  <p className="text-gray-700 capitalize">{sessionInfo.current_ip_scope || 'unknown'}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <p className="font-medium text-gray-900 mb-1">Current Device</p>
                <p className="text-sm text-gray-700">{shortUserAgent(sessionInfo.current_user_agent)}</p>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <p className="font-medium text-gray-900 mb-3">Recent Login Sessions</p>
                {sessionInfo.recent_sessions.length === 0 ? (
                  <p className="text-sm text-gray-600">No recent sessions found.</p>
                ) : (
                  <div className="space-y-2">
                    {sessionInfo.recent_sessions.map((session, idx) => (
                      <div key={`${session.created_at}-${idx}`} className="rounded-lg bg-gray-50 p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-medium text-gray-900 capitalize">{session.auth_provider} login</span>
                          <span className="text-gray-500">{formatDateTime(session.created_at)}</span>
                        </div>
                        <p className="text-gray-700 mt-1">
                          IP: {session.ip_address || 'Unknown'} | Device: {shortUserAgent(session.user_agent)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sessionError && <p className="mt-3 text-sm text-red-700">{sessionError}</p>}
            </>
          )}

          <div className="mt-4">
            <Button variant="secondary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            This permanently deletes your account and all data. Type <span className="font-semibold">DELETE MY ACCOUNT</span> to confirm.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Confirmation text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
            />
            <Input
              label="Current password (optional for social login users)"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Current password"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="danger"
              disabled={deleteConfirm !== 'DELETE MY ACCOUNT' || isDeleting}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Delete Account Permanently
            </Button>
            {deleteMessage && <span className="text-sm text-red-700">{deleteMessage}</span>}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
