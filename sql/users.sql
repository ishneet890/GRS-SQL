
USE dbms;

CREATE TABLE users(
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