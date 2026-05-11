-- =======================================================================================
-- Core Database Schema for NeuraVoting (Electronic Voting System)
-- =======================================================================================
-- Naming Conventions Enforced:
-- Tables: PascalCase
-- Columns: camelCase
-- =======================================================================================

CREATE DATABASE NeuraVoting;
GO

USE NeuraVoting;
GO

-- =========================================
-- 1. Users Table (Admin/Voter roles)
-- =========================================
CREATE TABLE Users (
    userId INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Voter')),
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    isActive BIT NOT NULL DEFAULT 1
);
GO

-- =========================================
-- 2. Elections Table
-- =========================================
CREATE TABLE Elections (
    electionId INT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    startDate DATETIME2 NOT NULL,
    endDate DATETIME2 NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Upcoming', 'Active', 'Completed', 'Cancelled')),
    createdByUserId INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Elections_Users FOREIGN KEY (createdByUserId) REFERENCES Users(userId)
);
GO

-- =========================================
-- 3. Candidates Table
-- =========================================
CREATE TABLE Candidates (
    candidateId INT IDENTITY(1,1) PRIMARY KEY,
    electionId INT NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    partyAffiliation VARCHAR(100),
    manifesto NVARCHAR(MAX),
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Candidates_Elections FOREIGN KEY (electionId) REFERENCES Elections(electionId)
);
GO

-- =========================================
-- 4. VoterRegistrations Table
-- =========================================
CREATE TABLE VoterRegistrations (
    registrationId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    electionId INT NOT NULL,
    registrationDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    isApproved BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_VoterRegistrations_Users FOREIGN KEY (userId) REFERENCES Users(userId),
    CONSTRAINT FK_VoterRegistrations_Elections FOREIGN KEY (electionId) REFERENCES Elections(electionId),
    -- Ensure a user can only register once per election
    CONSTRAINT UQ_VoterRegistration UNIQUE (userId, electionId)
);
GO

-- =========================================
-- 5. Votes Table (Blockchain Ledger)
-- =========================================
CREATE TABLE Votes (
    electionId INT NOT NULL,
    blockIndex INT NOT NULL,
    voterId VARCHAR(256) NOT NULL, -- Encrypted/anonymized voter ID
    candidateId INT NOT NULL,
    previousHash VARCHAR(256) NOT NULL,
    currentHash VARCHAR(256) NOT NULL,
    timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Votes PRIMARY KEY (electionId, blockIndex),
    CONSTRAINT FK_Votes_Elections FOREIGN KEY (electionId) REFERENCES Elections(electionId),
    CONSTRAINT FK_Votes_Candidates FOREIGN KEY (candidateId) REFERENCES Candidates(candidateId),
    -- Prevent double voting by the same anonymized voter in the same election
    CONSTRAINT UQ_Votes_VoterId_Election UNIQUE (voterId, electionId) 
);
GO

-- =========================================
-- 6. Indexes for Highly Queried Columns
-- =========================================

-- Elections
CREATE INDEX IX_Elections_Status ON Elections(status);

-- Candidates
CREATE INDEX IX_Candidates_ElectionId ON Candidates(electionId);

-- VoterRegistrations
CREATE INDEX IX_VoterRegistrations_UserId ON VoterRegistrations(userId);
CREATE INDEX IX_VoterRegistrations_ElectionId ON VoterRegistrations(electionId);

-- Votes (Ledger query optimizations)
CREATE INDEX IX_Votes_ElectionId ON Votes(electionId);
CREATE INDEX IX_Votes_CandidateId ON Votes(candidateId);
CREATE INDEX IX_Votes_VoterId ON Votes(voterId);
GO

-- =========================================
-- 7. Stored Procedures
-- =========================================
GO
CREATE PROCEDURE GetElectionLedger
    @electionId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Retrieve the blockchain ledger for a specific election
    -- Ordered by blockIndex to ensure the chain can be verified sequentially
    SELECT 
        electionId,
        blockIndex,
        voterId,
        candidateId,
        previousHash,
        currentHash,
        timestamp
    FROM Votes
    WHERE electionId = @electionId
    ORDER BY blockIndex ASC;
END;
GO
