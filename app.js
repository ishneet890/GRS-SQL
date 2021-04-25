const express = require('express');
const mysql = require('mysql');
const app = express();
const sql_password=require('D:/DBMSP/password.js');
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	database : 'dbms',
	password:sql_password
});
const port=3000;
connection.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
  });
// app.uses ---------------------------------------
app.use(express.urlencoded({extended:true}));
// ------------------------------------------------

// app.sets ---------------------------------------
app.set('view engine','ejs');
// ------------------------------------------------
const q = 'SHOW DATABASES';
connection.query(q,function(error,results,fields){
	if(error)throw error;
	console.log(results);
});

app.get('/',(req,res)=>{
	const q = 'SELECT COUNT(*) AS count FROM users';
	const query = connection.query(q,function(error,results,fields){
		if(error)throw error;
		var totalUsers = (results[0].count);
		res.render('homepage',{totalUsers});
	})
})

app.get('/user/signup',(req,res)=>{
	res.render('user/signup');
})
// CREATE 
app.post('/user/signup',(req,res)=>{
	const {email,pass_word,fName,lName,age,occupation,gender,phone,address} = req.body;
	
	let user = {
		email : email,
		pass_word : pass_word,
		fName : fName,
		lName : lName,
		age : age,
		occupation : occupation,
		gender : gender,
		phone : phone,
		address : address
	}
	// res.send(user);
	// Inserting data | single user
	// let person = {
	// 	email : faker.internet.email()
	// };

	try{
		connection.query('INSERT INTO users SET ?',user,function(error,results,fields){
			if(error)throw error;
			console.log(results);
			res.send(results);
		});
		// console.log(user);
	}
	catch(err){
		res.send(err.message);
	}
})

app.get('/user/login',(req,res)=>{
	res.render('user/login');
})

app.post('/user/login',(req,res)=>{
	const {email,pass_word} = req.body;
	// res.send(pass_word);
	const q = 'SELECT id FROM users WHERE email = ? AND pass_word = ?';
	// res.send(q);
	let user;
	connection.query(q,[email,pass_word],function(error,results,fields){
			if(error)throw error;
			if(results.length==0)return res.send('hola');
			user = results[0];
			console.log(results);
			const str = `/user/${results[0].id}/dashboard`;
			// res.send(str);
			res.redirect(`/user/${results[0].id}/dashboard`);
	});
	
})

app.get('/user/:id/dashboard',(req,res)=>{
	const {id} = req.params;
	const q = 'SELECT description FROM complaints WHERE userID = ?';
	let complaints = [];
	connection.query(q,id,function(error,results,fields){
			if(error)throw error;
			// user = results[0];
			// console.log(results);
			// res.send(results);
			res.render('user/dashboard',{id,complaints:results});
			// const str = `/user/${results[0].id}/dashboard`;
			// res.send(str);
			// res.redirect(`/user/${results[0].id}/dashboard`);
	});	
})

app.get('/user/:id/addComplaint',(req,res)=>{
	const {id} = req.params;
	res.render('user/addComplaint',{id});
})

app.post('/user/:id/addComplaint',(req,res)=>{
	const {areaCode,description} = req.body;
	const {id} = req.params;
	
	let newComplaint = {
		areaCode : areaCode,
		description : description,
		userID : id
	}
	connection.query('INSERT INTO complaints SET ?',newComplaint,function(error,results,fields){
			if(error)throw error;
			console.log(results);
			res.redirect(`/user/${id}/dashboard`);
	});
		// console.log(user);
})

app.get('/user/:id/myComplaints',(req,res)=>{
	const {id} = req.params;
	const q = 'SELECT * FROM complaints WHERE userID = ?';
	connection.query(q,id,function(error,results,fields){
			if(error)throw error;
			// user = results[0];
			// console.log(results);
			// res.send(results);
			console.log(results);
			res.render('user/myComplaints',{id,complaints:results});
			// const str = `/user/${results[0].id}/dashboard`;
			// res.send(str);
			// res.redirect(`/user/${results[0].id}/dashboard`);
	});	
})

app.get('/user/:uID/complaint/:cID',(req,res)=>{
	const {cID} = req.params;
	const q = 'SELECT * FROM complaints WHERE ID = ?';
	connection.query(q,cID,function(error,results,fields){
			if(error)throw error;
			// user = results[0];
			// console.log(results);
			// res.send(results);
			// res.send(results[0]);
			res.render('user/viewComplaint',{complaint:results[0]});
			// const str = `/user/${results[0].id}/dashboard`;
			// res.send(str);
			// res.redirect(`/user/${results[0].id}/dashboard`);
	});	
})

app.listen(port,()=>{
	console.log(`Port ${port} open`);
})