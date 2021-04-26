USE dbms;

CREATE TABLE complaints(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    areaCode VARCHAR(50),
    description VARCHAR(250),
    _status INT DEFAULT 0,
    userID INT,
    municipalID INT,
    createdAt TIMESTAMP DEFAULT NOW(),
    report VARCHAR(250),
    FOREIGN KEY (userID) REFERENCES users(ID) ON DELETE CASCADE,
    FOREIGN KEY (municipalID) REFERENCES municipal(ID) ON DELETE CASCADE
    
);
    -- # municipalID INT,


    -- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mypassword;
    -- FLUSH PRIVILEGES;   
    -- SELECT user, host, plugin, authentication_string FROM mysql.user
