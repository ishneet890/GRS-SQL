const express = require('express');
const mysql = require('mysql');
const path=require('path');
const sql_password=require('D:/DBMS/password.js');
const create_tables_query=require('./sql/create_tables');
const app = express();
const port=3000;

// --------------------------------------------------------
//SQL CONNECTION:
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password: sql_password,
	multipleStatements : true
});
connection.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});
// --------------------------------------------------------
//CREATES SQL TABLES IN DATABASE:
connection.query(create_tables_query,function(error,results,fields){
	if(error)throw error;
});
// --------------------------------------------------------

// --------------------------------------------------------
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'))
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
// --------------------------------------------------------

// --------------------------------------------------------
//ROUTES:

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
	const {areaCode,description,deptID} = req.body;
	const {id} = req.params;
	
	let newComplaint = {
		areaCode : areaCode,
		description : description,
		userID : id,
		deptID : deptID
	}
	try{
		connection.query('INSERT INTO complaints SET ?',newComplaint,function(error,results,fields){
				if(error){
					return res.send(error);
				}
				console.log(results);
				return res.redirect(`/user/${id}/dashboard`);
		});
	}
	catch(err){
		res.send(err);
	}
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


// Municipal Routes -----------------------------------------------------------------------------
app.get('/municipal/login',(req,res)=>{
	
	res.render('municipal/login')

});

app.post('/municipal/login',(req,res)=>{
	const {email,pass_word} = req.body;
//	res.send(email);
	const q = 'SELECT * FROM municipal WHERE email = ? AND pass_word = ?';
	
	let user;
	connection.query(q,[email,pass_word],function(error,results,fields){
			if(error)throw error;
			if(results.length==0){
				return res.send('nonexistent');
			}
			user = results[0];
			console.log(results);
		//	res.send(user);
		var email=results[0].email;
		
		//res.send(`/municipal/${results[0].id}/dashboard`);
		res.redirect(`/municipal/${results[0].ID}/dashboard`);
	});
});

app.get('/municipal/:id/dashboard',(req,res)=>{
	const {id} = req.params;
	const q = 'select DISTINCT deptID,name from municipal join department on municipal.deptID = department.ID WHERE municipal.id = ?';
	let complaints = [];
	connection.query(q,id,function(error,results,fields){
		if(error)throw error;
		// // if(results.length==0)return res.send('hola');
		// res.render('municipal/dashboard',{id,complaints:results});
		// return res.send(results);
		const deptID = results[0].deptID;
		const dept = results[0].name;
			const q1 = 'SELECT * FROM complaints WHERE deptID = ?';
			connection.query(q1,deptID,function(error1,results1,fields1){
				if(error1)throw error1;
				// res.send(results1);
				// if(results.length==0)return res.send('hola');
				res.render('municipal/dashboard',{dept,id,complaints:results1});
		});
	});
});


app.get('/municipal/:id/view',(req,res)=>{
	const {id} = req.params;
	const q='SELECT * FROM complaints WHERE ID=?'
	connection.query(q,id,function(error,results,fields){
			if(error)throw error;
			if(results.length==0)return res.send('hola');
			res.render('municipal/viewComplaint',{complaint:results[0]});
	});
});

app.get('/municipal/:id/update',(req,res)=>{
	const {id} = req.params;
	//res.send('help');
	const q='SELECT _status FROM complaints WHERE id=?'
	connection.query(q,id,function(error,results,fields){
			if(error)throw error;
			if(results.length==0)return res.send('hola');
			res.render('municipal/update',{id,status:results[0]._status});
	});
});

app.post('/municipal/:id/update',(req,res)=>{
	const {_status} = req.body;
	const {id} = req.params;
	//res.send(req.body._status);
	const q='UPDATE complaints SET _status= ? where id=?';
	connection.query(q,[_status,id],function(error,results,fields){
			if(error)throw error;
			//if(results.length==0)return res.send('hola');
		//res.send('record updated');
		//res.redirect('/municipal/:id')
			res.redirect(`/municipal/${id}/update`);
	});
		// console.log(user);
});

app.get('/municipal/:id/write_review',(req,res)=>{
	const {id}=req.params;
	res.render('municipal/review',{id});
});

app.post('/municipal/:id/write_review',(req,res)=>{
	const {report} = req.body;
	const {id} = req.params;
	//res.send(req.body._status);
	const q='UPDATE complaints SET report= ? where ID=?';
	connection.query(q,[report,id],function(error,results,fields){
			if(error)throw error;
			//if(results.length==0)return res.send('hola');
		//res.send('record updated');
		//res.redirect('/municipal/:id')
		res.send('WRITTEN!!');
		//	res.redirect(`/municipal/${id}/dashboard`);
	});
		// console.log(user);
});

// Admin Routes -----------------------------

app.get('/admin/login',(req,res)=>{
	res.render('admin/login');
})

app.post('/admin/login',(req,res)=>{
	const {email,pass_word} = req.body;
	const q = 'SELECT * FROM admin WHERE email = ? AND pass_word = ?';
	connection.query(q,[email,pass_word],function(error,results,fields){
			if(error)throw error;
			if(results.length==0)return res.send('hola');
			res.render('admin/dashboard');
	});
	
})

app.get('/admin/addMunicipal',(req,res)=>{
	res.render('admin/addMunicipal');
})

app.post('/admin/addMunicipal',(req,res)=>{
	const {deptID,email,pass_word,fName,lName,age,gender,phone,address} = req.body;
	
	let user = {
		deptID : deptID,
		email : email,
		pass_word : pass_word,
		fName : fName,
		lName : lName,
		age : age,
		gender : gender,
		phone : phone,
		address : address
	} 
	try{
		connection.query('INSERT INTO municipal SET ?',user,function(error,results,fields){
			if(error){
				return res.send(error.sqlMessage);
			}
			console.log(results);
			return res.send(results);
		});
		// console.log(user);
	}
	catch(err){
		res.send(err.message);
	}
})

app.get('/admin/complaint/all',(req,res)=>{
	connection.query('SELECT * FROM complaints',function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		console.log(results);
		// res.send(results);
		return res.render('admin/allComplaints',{complaints : results})
	});
})

app.get('/admin/complaint/:id',(req,res)=>{
	const {id} = req.params;
	// return res.send(id);
	connection.query('SELECT * FROM complaints WHERE ID = ?',id,function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		console.log(results);
		// res.send(results);
		return res.render('admin/viewComplaint',{complaint : results[0]})
	});
})

app.get('*',(req,res)=>{
	res.render('PageNotFound');
})
app.listen(port,()=>{
	console.log(`Port ${port} open`);
})
