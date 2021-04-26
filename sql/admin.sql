CREATE DATABASE IF NOT EXISTS dbms;
USE dbms;
CREATE TABLE IF NOT EXISTS admin (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    pass_word VARCHAR(255)
);

INSERT INTO admin (email,pass_word) VALUES ('admin@gmail.com','admin');