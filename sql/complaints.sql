
USE dbms;

CREATE TABLE complaint(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    areaCode VARCHAR(50),
    description VARCHAR(250),
    _status INT DEFAULT 0,
    userID INT,
    createdAt TIMESTAMP DEFAULT NOW(),
    report VARCHAR(250),
    FOREIGN KEY (userID) REFERENCES users(ID) ON DELETE CASCADE
);
    -- # municipalID INT,