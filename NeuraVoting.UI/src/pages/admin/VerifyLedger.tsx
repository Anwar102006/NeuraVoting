import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Loader2, Play } from 'lucide-react';

// Interfaces mapping to the backend Data Transfer Objects (DTOs)
interface Election {
  electionId: number;
  title: string;
  status: string;
  startDate: string;
}

interface VerificationResult {
  isValid: boolean;
  totalBlocks: number;
  errorBlockIndex?: number;
  errorMessage?: string;
}

const VerifyLedger: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  // State mapping verification results directly to specific election IDs
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, VerificationResult>>({});

  useEffect(() => {
    // Mock API fetch for demonstration purposes
    setTimeout(() => {
      setElections([
        { electionId: 1, title: 'Presidential Election 2026', status: 'Active', startDate: '2026-05-10T00:00:00Z' },
        { electionId: 2, title: 'Senate Midterms', status: 'Completed', startDate: '2024-11-04T00:00:00Z' },
        { electionId: 3, title: 'Local City Council', status: 'Upcoming', startDate: '2026-08-15T00:00:00Z' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const triggerVerification = async (electionId: number) => {
    setVerifyingId(electionId);
    
    try {
      /* MOCK API CALL for actual integration
      const res = await fetch(`/api/admin/ledger/${electionId}/verify`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      
      // The backend cleanly returns 200 for valid, 409 for tampered
      setResults(prev => ({ ...prev, [electionId]: json.data }));
      */

      // Simulated cryptographic latency to allow the progress bar to animate
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simulate a random tampering event for demonstration strictly on election 2
      if (electionId === 2) {
        setResults(prev => ({
          ...prev,
          [electionId]: {
            isValid: false,
            totalBlocks: 1420,
            errorBlockIndex: 843,
            errorMessage: 'Data Tampering Detected! Block 843 payload was modified post-insertion. Previous Hash mismatch.'
          }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [electionId]: {
            isValid: true,
            totalBlocks: 512
          }
        }));
      }

    } catch (err: any) {
      alert('Network error while attempting cryptographic verification.');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <Loader2 className="spinner" size={48} color="var(--primary)" />
        <p style={{ marginTop: 16 }}>Loading Election Ledger Data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Cryptographic Ledger Verification</h1>
        <p>Trigger manual audits to mathematically prove the integrity of the voting data.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {elections.map(election => {
          const isVerifying = verifyingId === election.electionId;
          const result = results[election.electionId];

          return (
            <div key={election.electionId} className="glass-card" style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{election.title}</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Status: {election.status} • Ledger ID: #{election.electionId}
                </span>
              </div>

              {/* Action / Status Area */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: '300px', justifyContent: 'flex-end' }}>
                
                {/* Mathematical Result Badges */}
                {result && !isVerifying && (
                  result.isValid ? (
                    <div style={styles.validBadge}>
                      <ShieldCheck size={20} />
                      <span>Ledger Intact ({result.totalBlocks} Blocks)</span>
                    </div>
                  ) : (
                    <div style={styles.invalidBadge}>
                      <ShieldAlert size={20} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>Security Alert</strong>
                        <span style={{ fontSize: '0.8rem' }}>Tampering at Block #{result.errorBlockIndex}</span>
                      </div>
                    </div>
                  )
                )}

                {/* Progress Bar / Button */}
                {isVerifying ? (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <div style={styles.progressFill} className="progress-anim" />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Hashing Blockchain...</span>
                  </div>
                ) : (
                  <button 
                    style={styles.verifyButton} 
                    onClick={() => triggerVerification(election.electionId)}
                    disabled={verifyingId !== null}
                  >
                    <Play size={16} />
                    Verify Integrity
                  </button>
                )}
              </div>

              {/* Dynamic Error Message Expansion */}
              {result && !result.isValid && !isVerifying && (
                <div style={styles.errorDetails}>
                  <strong>Cryptographic Failure Trace:</strong>
                  <p style={{ marginTop: '4px', fontFamily: 'monospace' }}>{result.errorMessage}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>
        {`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          .progress-anim {
            animation: load 2.5s ease-in-out forwards;
          }
          @keyframes load {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  listItem: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    position: 'relative'
  },
  verifyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid var(--primary)',
    color: 'var(--text-main)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    width: '180px'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(79, 70, 229, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    borderRadius: '4px'
  },
  validBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#10B981',
    background: 'rgba(16, 185, 129, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600
  },
  invalidBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#EF4444',
    background: 'rgba(239, 68, 68, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    textAlign: 'left'
  },
  errorDetails: {
    width: '100%',
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.05)',
    borderLeft: '4px solid #EF4444',
    borderRadius: '4px',
    color: '#EF4444',
    fontSize: '0.9rem'
  }
};

export default VerifyLedger;
