import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader2, User } from 'lucide-react';

interface Candidate {
  candidateId: number;
  firstName: string;
  lastName: string;
  partyAffiliation: string;
  manifesto: string;
}

const VotingInterface: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        // In a real app, this is an actual fetch call:
        // const res = await fetch(`/api/candidates/election/${electionId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        // const data = await res.json();
        
        // Mock Data for UI demonstration
        setTimeout(() => {
          setCandidates([
            { candidateId: 1, firstName: 'Alice', lastName: 'Johnson', partyAffiliation: 'Progressive Party', manifesto: 'Education and Healthcare for all.' },
            { candidateId: 2, firstName: 'Bob', lastName: 'Smith', partyAffiliation: 'Conservative Alliance', manifesto: 'Economic growth and lower taxes.' },
            { candidateId: 3, firstName: 'Charlie', lastName: 'Davis', partyAffiliation: 'Independent', manifesto: 'Transparent governance and tech innovation.' }
          ]);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Failed to load candidates.');
        setLoading(false);
      }
    };

    if (electionId) fetchCandidates();
  }, [electionId]);

  const handleSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate) return;
    
    setIsVoting(true);
    
    try {
      // MOCK API CALL for Blockchain Ledger Append
      /*
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ electionId: parseInt(electionId!), candidateId: selectedCandidate.candidateId })
      });
      if (!res.ok) throw new Error(await res.text());
      */
      
      // Simulate cryptographic processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVoteSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Voting failed. Please try again.');
    } finally {
      setIsVoting(false);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <Loader2 className="spinner" size={48} color="var(--primary)" />
        <p style={{ marginTop: 16 }}>Loading Election Data...</p>
      </div>
    );
  }

  if (voteSuccess) {
    return (
      <div style={styles.centerContainer}>
        <CheckCircle size={80} color="#10B981" style={{ marginBottom: 24 }} />
        <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Vote Successfully Cast!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400, textAlign: 'center' }}>
          Your vote has been cryptographically secured and appended to the blockchain ledger. Your identity remains 100% anonymous.
        </p>
        <button style={styles.primaryButton} onClick={() => navigate('/voter/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Cast Your Vote</h1>
        <p>Select a candidate below. This action is final and secured by blockchain.</p>
      </div>

      <div style={styles.grid}>
        {candidates.map(candidate => (
          <div key={candidate.candidateId} className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.avatarPlaceholder}><User size={32} /></div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{candidate.firstName} {candidate.lastName}</h3>
                <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>{candidate.partyAffiliation}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '16px 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
              "{candidate.manifesto}"
            </p>
            <button style={styles.voteButton} onClick={() => handleSelect(candidate)}>
              Vote for {candidate.firstName}
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedCandidate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <AlertTriangle size={48} color="#F59E0B" style={{ marginBottom: 16 }} />
            <h2 style={{ marginBottom: 12 }}>Confirm Your Vote</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              You are about to cast your official vote for <strong>{selectedCandidate.firstName} {selectedCandidate.lastName}</strong>. 
              Due to blockchain immutability, this action <strong>cannot be undone</strong>. 
            </p>
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <button 
                style={styles.cancelButton} 
                onClick={() => setIsModalOpen(false)}
                disabled={isVoting}
              >
                Cancel
              </button>
              <button 
                style={styles.confirmButton} 
                onClick={confirmVote}
                disabled={isVoting}
              >
                {isVoting ? <Loader2 size={20} className="spinner" /> : 'Confirm & Cast Vote'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
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
    minHeight: '80vh',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '32px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'rgba(79, 70, 229, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)'
  },
  voteButton: {
    width: '100%',
    padding: '12px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    padding: '12px 32px',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600
  },
  confirmButton: {
    flex: 1,
    padding: '12px',
    background: 'var(--primary)',
    border: 'none',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default VotingInterface;
