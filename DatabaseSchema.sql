-- =======================================================================================
-- Core Database Schema for NeuraVoting (Electronic Voting System) - MySQL Version
-- =======================================================================================

CREATE DATABASE IF NOT EXISTS NeuraVoting;
USE NeuraVoting;

-- =========================================
-- 1. Users Table (Admin/Voter roles)
-- =========================================
CREATE TABLE Users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Voter')),
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    governmentId VARCHAR(50) UNIQUE,
    verificationStatus VARCHAR(30) NOT NULL DEFAULT 'Pending Verification',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isActive BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================================
-- 2. Elections Table
-- =========================================
CREATE TABLE Elections (
    electionId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Upcoming', 'Active', 'Completed', 'Cancelled')),
    createdByUserId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Elections_Users FOREIGN KEY (createdByUserId) REFERENCES Users(userId)
);

-- =========================================
-- 3. Candidates Table
-- =========================================
CREATE TABLE Candidates (
    candidateId INT AUTO_INCREMENT PRIMARY KEY,
    electionId INT NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    partyAffiliation VARCHAR(100),
    manifesto TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Candidates_Elections FOREIGN KEY (electionId) REFERENCES Elections(electionId)
);

-- =========================================
-- 4. VoterRegistrations Table
-- =========================================
CREATE TABLE VoterRegistrations (
    registrationId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    electionId INT NOT NULL,
    registrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isApproved BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT FK_VoterRegistrations_Users FOREIGN KEY (userId) REFERENCES Users(userId),
    CONSTRAINT FK_VoterRegistrations_Elections FOREIGN KEY (electionId) REFERENCES Elections(electionId),
    CONSTRAINT UQ_VoterRegistration UNIQUE (userId, electionId)
);

-- =========================================
-- 5. Votes Table (Blockchain Ledger)
-- =========================================
CREATE TABLE Votes (
    electionId INT NOT NULL,
    blockIndex INT NOT NULL,
    voterId VARCHAR(256) NOT NULL, 
    candidateId INT NOT NULL,
    previousHash VARCHAR(256) NOT NULL,
    currentHash VARCHAR(256) NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Votes PRIMARY KEY (electionId, blockIndex),
    CONSTRAINT FK_Votes_Elections FOREIGN KEY (electionId) REFERENCES Elections(electionId),
    CONSTRAINT FK_Votes_Candidates FOREIGN KEY (candidateId) REFERENCES Candidates(candidateId),
    CONSTRAINT UQ_Votes_VoterId_Election UNIQUE (voterId, electionId) 
);

-- =========================================
-- 6. Indexes for Highly Queried Columns
-- =========================================
CREATE INDEX IX_Elections_Status ON Elections(status);
CREATE INDEX IX_Candidates_ElectionId ON Candidates(electionId);
CREATE INDEX IX_VoterRegistrations_UserId ON VoterRegistrations(userId);
CREATE INDEX IX_VoterRegistrations_ElectionId ON VoterRegistrations(electionId);
CREATE INDEX IX_Votes_ElectionId ON Votes(electionId);
CREATE INDEX IX_Votes_CandidateId ON Votes(candidateId);
CREATE INDEX IX_Votes_VoterId ON Votes(voterId);

-- =========================================
-- 7. Stored Procedures
-- =========================================
DELIMITER //
CREATE PROCEDURE GetElectionLedger(IN p_electionId INT)
BEGIN
    SELECT 
        electionId,
        blockIndex,
        voterId,
        candidateId,
        previousHash,
        currentHash,
        timestamp
    FROM Votes
    WHERE electionId = p_electionId
    ORDER BY blockIndex ASC;
END //
DELIMITER ;
