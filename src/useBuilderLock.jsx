import React, { useState, useEffect, useRef } from 'react';
import { db, doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from './firebase';
import { Lock, Unlock, AlertTriangle, RefreshCw, Send, ShieldAlert, CheckCircle2, User, Key } from 'lucide-react';

const LOCK_DOC_PATH = 'builder_locks/active_session';
const HEARTBEAT_INTERVAL_MS = 15000;
const LOCK_TIMEOUT_MS = 60000; // 60s without heartbeat is considered expired

export function useBuilderLock() {
  const [currentUser, setCurrentUser] = useState(() => {
    // If inside Google AI Studio container or admin session
    const saved = localStorage.getItem('qb_author_name');
    if (saved) return saved;
    const isAiStudio = window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost');
    return isAiStudio ? 'Adam Lau (admin)' : '';
  });

  const [lockState, setLockState] = useState({
    lockedBy: '',
    userId: '',
    lastActive: null,
    isLocked: false,
    isOwner: false,
    transferRequestedBy: null,
    transferRequestTime: null,
  });

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showTakeoverConfirm, setShowTakeoverConfirm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [myClientId] = useState(() => {
    let cid = sessionStorage.getItem('qb_client_id');
    if (!cid) {
      cid = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem('qb_client_id', cid);
    }
    return cid;
  });

  // Listen to Firestore lock document in real-time
  useEffect(() => {
    if (!db) return;
    const lockRef = doc(db, 'builder_locks', 'active_session');

    const unsubscribe = onSnapshot(lockRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = Date.now();
        const lastActiveMillis = data.lastActive?.toMillis ? data.lastActive.toMillis() : (data.lastActiveEpoch || 0);
        const isExpired = (now - lastActiveMillis) > LOCK_TIMEOUT_MS;

        const isOwner = data.clientId === myClientId || (!data.lockedBy);
        const isLocked = !isExpired && !!data.lockedBy && data.clientId !== myClientId;

        setLockState({
          lockedBy: isExpired ? '' : (data.lockedBy || ''),
          userId: data.clientId || '',
          lastActive: lastActiveMillis,
          isLocked: isLocked,
          isOwner: !isLocked,
          transferRequestedBy: data.transferRequestedBy || null,
          transferRequestTime: data.transferRequestTime || null,
        });

        // If I am owner and someone requested edit access
        if (isOwner && data.transferRequestedBy && data.transferRequestedBy !== currentUser) {
          setNotification({
            type: 'access_requested',
            message: `${data.transferRequestedBy} requested edit access to the Quiz Builder.`,
            fromUser: data.transferRequestedBy
          });
        }
      } else {
        // Document does not exist yet -> Unlocked
        setLockState({
          lockedBy: '',
          userId: '',
          lastActive: 0,
          isLocked: false,
          isOwner: true,
          transferRequestedBy: null,
          transferRequestTime: null,
        });
      }
    }, (err) => {
      console.warn("Firestore lock listener warning:", err);
    });

    return () => unsubscribe();
  }, [myClientId, currentUser]);

  // Acquire or refresh lock heartbeat
  const touchLock = async (authorName) => {
    const userToUse = authorName || currentUser;
    if (!userToUse) {
      setIsPromptOpen(true);
      return false;
    }

    if (lockState.isLocked && !lockState.isOwner) {
      return false;
    }

    try {
      const lockRef = doc(db, 'builder_locks', 'active_session');
      await setDoc(lockRef, {
        lockedBy: userToUse,
        clientId: myClientId,
        lastActive: serverTimestamp(),
        lastActiveEpoch: Date.now(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("Failed to acquire lock in Firestore:", e);
      return false;
    }
  };

  // Heartbeat loop for the active owner
  useEffect(() => {
    if (!lockState.isOwner || !currentUser) return;

    const interval = setInterval(() => {
      touchLock(currentUser);
    }, HEARTBEAT_INTERVAL_MS);

    // Initial claim
    touchLock(currentUser);

    return () => clearInterval(interval);
  }, [lockState.isOwner, currentUser, myClientId]);

  // Request Edit Access
  const requestEditAccess = async () => {
    if (!currentUser) {
      setIsPromptOpen(true);
      return;
    }
    try {
      const lockRef = doc(db, 'builder_locks', 'active_session');
      await updateDoc(lockRef, {
        transferRequestedBy: currentUser,
        transferRequestTime: Date.now()
      });
      setNotification({
        type: 'info',
        message: `Edit access requested! Notified ${lockState.lockedBy || 'the active editor'}.`
      });
    } catch (e) {
      console.error("Error requesting edit access:", e);
    }
  };

  // Force Takeover
  const forceTakeover = async () => {
    let name = currentUser;
    if (!name) {
      name = prompt("Please enter your name for Force Takeover:", "Adam Lau (admin)") || 'Admin';
      setCurrentUser(name);
      localStorage.setItem('qb_author_name', name);
    }
    try {
      const lockRef = doc(db, 'builder_locks', 'active_session');
      await setDoc(lockRef, {
        lockedBy: name,
        clientId: myClientId,
        lastActive: serverTimestamp(),
        lastActiveEpoch: Date.now(),
        transferRequestedBy: null,
        transferRequestTime: null,
        forcedAt: new Date().toISOString()
      });
      setShowTakeoverConfirm(false);
      setNotification({
        type: 'success',
        message: `Takeover complete. You now have exclusive edit control as ${name}.`
      });
    } catch (e) {
      console.error("Force takeover error:", e);
    }
  };

  // Release lock
  const releaseLock = async () => {
    try {
      const lockRef = doc(db, 'builder_locks', 'active_session');
      await setDoc(lockRef, {
        lockedBy: '',
        clientId: '',
        lastActiveEpoch: 0,
        transferRequestedBy: null
      });
      setNotification({
        type: 'info',
        message: 'Lock released. Anyone can now edit.'
      });
    } catch (e) {
      console.error("Release lock error:", e);
    }
  };

  const saveUserName = (name) => {
    const trimmed = name.trim() || 'Team Member';
    setCurrentUser(trimmed);
    localStorage.setItem('qb_author_name', trimmed);
    setIsPromptOpen(false);
    touchLock(trimmed);
  };

  return {
    currentUser,
    setCurrentUser,
    lockState,
    isPromptOpen,
    setIsPromptOpen,
    nameInput,
    setNameInput,
    showTakeoverConfirm,
    setShowTakeoverConfirm,
    notification,
    setNotification,
    touchLock,
    requestEditAccess,
    forceTakeover,
    releaseLock,
    saveUserName
  };
}

export function LockBottomBar({ lockHook }) {
  const {
    currentUser,
    lockState,
    setIsPromptOpen,
    setShowTakeoverConfirm,
    requestEditAccess,
    forceTakeover,
    releaseLock,
    touchLock
  } = lockHook;

  const isReadOnly = lockState.isLocked;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: isReadOnly ? '#FEE2E2' : '#EFF6FF',
        borderTop: isReadOnly ? '1px solid #FCA5A5' : '1px solid #BFDBFE',
        color: isReadOnly ? '#991B1B' : '#1E40AF',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        fontWeight: 600,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isReadOnly ? (
          <>
            <Lock size={15} color="#DC2626" />
            <span>
              <strong style={{ color: '#B91C1C' }}>READ ONLY:</strong> Locked by{' '}
              <span style={{ 
                background: '#FEF2F2', 
                border: '1px solid #F87171', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                color: '#991B1B', 
                fontWeight: 700 
              }}>
                {lockState.lockedBy || 'Another Editor'}
              </span>
            </span>
          </>
        ) : (
          <>
            <Unlock size={15} color="#2563EB" />
            <span>
              <strong style={{ color: '#1D4ED8' }}>EDITING ACTIVE:</strong> You are editing as{' '}
              <button
                type="button"
                onClick={() => setIsPromptOpen(true)}
                style={{
                  background: '#DBEAFE',
                  border: '1px solid #93C5FD',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: '#1E40AF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Click to change your display name"
              >
                {currentUser || 'Set Name'} ✏️
              </button>
            </span>
            <span style={{ color: '#059669', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
              Firestore Live Synced
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isReadOnly ? (
          <>
            <button
              type="button"
              onClick={() => touchLock()}
              style={{
                background: 'white',
                border: '1px solid #D1D5DB',
                color: '#374151',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} /> Recheck
            </button>
            <button
              type="button"
              onClick={requestEditAccess}
              style={{
                background: '#EF4444',
                border: 'none',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Request Edit Access
            </button>
            <button
              type="button"
              onClick={() => setShowTakeoverConfirm(true)}
              style={{
                background: '#7F1D1D',
                border: 'none',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Force Takeover
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={releaseLock}
              style={{
                background: 'white',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Release the lock so team members can edit"
            >
              Release Lock
            </button>
          </>
        )}

        <div style={{ paddingLeft: '8px', borderLeft: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' }}>
          {isReadOnly ? (
            <Lock size={16} color="#EF4444" />
          ) : (
            <Unlock size={16} color="#3B82F6" />
          )}
        </div>
      </div>
    </div>
  );
}

export function LockNameModal({ lockHook }) {
  const { isPromptOpen, setIsPromptOpen, nameInput, setNameInput, saveUserName, currentUser } = lockHook;

  if (!isPromptOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '50%', color: '#1D4ED8' }}>
            <User size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#0F172A' }}>Collaborator Name</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Enter your name to claim the live editing lock.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveUserName(nameInput || currentUser || 'Adam Lau (admin)'); }}>
          <input
            type="text"
            placeholder="e.g. Adam Lau (admin) or Sarah Jenkins"
            value={nameInput !== undefined && nameInput !== '' ? nameInput : currentUser}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1.5px solid #93C5FD',
              borderRadius: '6px',
              marginBottom: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsPromptOpen(false)}
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: '13px', background: '#1D4ED8' }}
            >
              Set Name &amp; Claim Lock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ForceTakeoverModal({ lockHook }) {
  const { showTakeoverConfirm, setShowTakeoverConfirm, forceTakeover, lockState } = lockHook;

  if (!showTakeoverConfirm) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#FEE2E2', padding: '10px', borderRadius: '50%', color: '#DC2626' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#991B1B' }}>Force Takeover Lock</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Override active editor session
            </p>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginBottom: '18px' }}>
          The quiz builder is currently locked by <strong>{lockState.lockedBy || 'another user'}</strong>. 
          Forcing takeover will immediately switch their view to Read Only and grant you full editing permissions.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowTakeoverConfirm(false)}
            className="btn btn-secondary"
            style={{ fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={forceTakeover}
            className="btn btn-primary"
            style={{ fontSize: '13px', background: '#DC2626' }}
          >
            Confirm Takeover
          </button>
        </div>
      </div>
    </div>
  );
}
