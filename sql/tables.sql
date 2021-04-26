CREATE DATABASE IF NOT EXISTS dbms;
USE dbms;

-- USERS TABLE:
CREATE TABLE IF NOT EXISTS users(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50),
    pass_word VARCHAR(50),  
    fName VARCHAR(50),
    lName VARCHAR(50),
    age   INT,
    occupation VARCHAR(50),
    gender VARCHAR(50),
    phone VARCHAR(20),
    address VARCHAR(100)
);
-- DEPARTMENT TABLE
CREATE TABLE IF NOT EXISTS department(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50)
);
-- MUNICIPAL TABLE:
CREATE TABLE IF NOT EXISTS municipal(
    ID int AUTO_INCREMENT PRIMARY Key,
    -- dept VARCHAR(50),
    deptID INT,
    fName VARCHAR(50),
    lName VARCHAR(50),
    age VARCHAR(50),
    email VARCHAR(50),
    pass_word VARCHAR(50),
    gender VARCHAR(50),
    phone VARCHAR(50),
    address VARCHAR(50),
    FOREIGN KEY(deptID) REFERENCES department(ID) ON DELETE CASCADE
);

-- COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    areaCode VARCHAR(50),
    description VARCHAR(250),
    _status INT DEFAULT 0,
    userID INT,
    deptID INT,
    municipalID INT,
    createdAt TIMESTAMP DEFAULT NOW(),
    report VARCHAR(250),
    FOREIGN KEY (userID) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (municipalID) REFERENCES municipal(ID) ON DELETE CASCADE,    
    FOREIGN KEY(deptID) REFERENCES department(ID) ON DELETE CASCADE
);

-- ADMIN TABLE
CREATE TABLE IF NOT EXISTS admin (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    pass_word VARCHAR(255)
);