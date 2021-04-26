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
insert into users (email,pass_word,fName,lName,age,occupation,gender,phone,address) values("user1@gmail.com","user1","user1","user1",20,"occup","male","phuser1","addruser1");
