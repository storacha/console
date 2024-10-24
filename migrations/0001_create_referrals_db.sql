-- Migration number: 0001 	 2024-10-21T15:14:46.268Z

-- users identified by email. each user has a refcode they can use to invite other users
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY, 
  refcode TEXT UNIQUE
);

-- referrals identified by email. each referral tracks the refcode it was referred by.
-- "reward" tracks whether the referee has paid long enough for the referrer to be rewarded
CREATE TABLE IF NOT EXISTS referrals (
  email TEXT PRIMARY KEY, 
  refcode TEXT UNIQUE,
  referred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reward BOOLEAN,
  FOREIGN KEY(refcode) REFERENCES users(refcode)
);
