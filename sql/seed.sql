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
    ID INT AUTO_INCREMENT PRIMARY Key,
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
    FOREIGN KEY (deptID) REFERENCES department(ID) ON DELETE CASCADE
);

-- ADMIN TABLE
CREATE TABLE IF NOT EXISTS admin (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    pass_word VARCHAR(255)
);

-- SEED DATA
INSERT INTO users(email,pass_word,fName,lName,age,occupation,gender,phone,address) VALUES
("user1@gmail.com","user1","user1","user1",27,"teacher","male","9873283728","addruser1"),
("user2@gmail.com","user2","user2","user2",23,"engineer","male","8723820323","addruser2"),
("user3@gmail.com","user3","user3","user3",37,"doctor","female","7823902332","addruser3");

INSERT INTO department (name) VALUES
('Fire'),
('Health'),
('Water'),
('Electricity');

INSERT INTO municipal(email,pass_word,fName,lName,age,deptID,gender,phone,address) VALUES
("mun1@gmail.com","mun1","mun1","mun1",45,1,"male","8932839232","addrmun1"),
("mun2@gmail.com","mun2","mun2","mun2",38,2,"male","9812918983","addrmun2"),
("mun3@gmail.com","mun3","mun3","mun3",39,3,"female","8291283232","addrmun3"),
("mun4@gmail.com","mun4","mun4","mun4",37,4,"female","7821223363","addrmun4");

INSERT INTO admin (email,pass_word) VALUES 
('admin@gmail.com','admin');