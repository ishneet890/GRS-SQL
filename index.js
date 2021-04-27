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

app.listen(port,()=>{
	console.log(`Port ${port} open`);
})

app.get('/',(req,res)=>{
	const q = 'SELECT COUNT(*) AS count FROM users';
	const query = connection.query(q,function(error,results,fields){
		if(error)throw error;
		var totalUsers = (results[0].count);
		res.render('homepage',{totalUsers});
	})
})

// USER ROUTES:--------------------------------------------
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
	try{
		connection.query('INSERT INTO users SET ?',user,function(error,results,fields){
			if(error)throw error;
			res.redirect('/user/login');
		});
	}
	catch(err){
		console.log(err);
		res.redirect('/user/signup');
	}
})

app.get('/user/login',(req,res)=>{
	res.render('user/login');
})

app.post('/user/login',(req,res)=>{
	const {email,pass_word} = req.body;
	const q = 'SELECT id FROM users WHERE email = ? AND pass_word = ?';
	connection.query(q,[email,pass_word],function(error,results,fields){
			if(error)throw error;
			if(results.length==0){
				return res.redirect('/user/login');
			}
			console.log(results);
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
	// const q = 'SELECT * FROM complaints WHERE ID = ?';
	const q= 'select complaints.*, department.name AS dept  from complaints join department on complaints.deptID = department.ID WHERE complaints.ID = ?'
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

// MUNICIPAL ROUTES:---------------------------------------
app.get('/municipal/login',(req,res)=>{	
	res.render('municipal/login')
});

app.post('/municipal/login',(req,res)=>{
	const {email,pass_word} = req.body;
	const q = 'SELECT * FROM municipal WHERE email = ? AND pass_word = ?';	
	connection.query(q,[email,pass_word],function(error,results,fields){
		if(error)throw error;
		if(results.length==0){
			return res.redirect('/municipal/login');
		}
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
	// const q='SELECT * FROM complaints WHERE ID=?'
	const q='select complaints.*, department.name AS dept  from complaints join department on complaints.deptID = department.ID WHERE complaints.ID = ?'
	connection.query(q,id,function(error,results,fields){
			if(error)throw error;
			if(results.length==0)return res.send('hola');
			res.render('municipal/viewComplaint',{complaint:results[0]});
	});
});

app.post('/municipal/:id/flag',(req,res)=>{
	const {id} = req.params;
	const q  = 'UPDATE complaints SET _status= 2 where id=?';
	connection.query(q,id,function(error,results,fields){
		if(error)throw error;
		res.redirect(`/municipal/${id}/view`);
	});
});

app.get('/municipal/:id/resolve',(req,res)=>{
	const {id} = req.params;
	res.render('municipal/writeReport',{cID : id});
});

app.post('/municipal/:id/resolve',(req,res)=>{
	const {id} = req.params;
	const {report} = req.body;
	const q  = 'UPDATE complaints SET _status= 1, report = ? WHERE id=?';
	connection.query(q,[report,id],function(error,results,fields){
		if(error)throw error;
		res.redirect(`/municipal/${id}/view`);
	});
});

// ADMIN ROUTES:-------------------------------------------
app.get('/admin/login',(req,res)=>{
	res.render('admin/login');
})

app.post('/admin/login',(req,res)=>{
	const {email,pass_word} = req.body;
	const q = 'SELECT * FROM admin WHERE email = ? AND pass_word = ?';
	connection.query(q,[email,pass_word],function(error,results,fields){
			if(error)throw error;
			if(results.length==0){
				return res.redirect('/admin/login');
			}
			res.redirect('/admin/dashboard');
	});	
})

app.get('/admin/dashboard',(req,res)=>{
	res.render('admin/dashboard');
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

app.get('/admin/complaint/flagged',(req,res)=>{
	const q = 'SELECT * FROM complaints WHERE _status=2'
	connection.query(q,function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		console.log(results);
		// res.send(results);
		return res.render('admin/flaggedComplaints',{complaints : results})
	});
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

app.get('/admin/complaint/:cID',(req,res)=>{
	const {cID} = req.params;
	// return res.send(id);
	const q= 'SELECT complaints.*, department.name AS dept  from complaints join department on complaints.deptID = department.ID WHERE complaints.ID = ?'
	connection.query(q,cID,function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		return res.render('admin/viewComplaint',{complaint : results[0]})
	});
})

app.get('/admin/complaint/:cID/discard',(req,res)=>{
	const {cID} = req.params;
	res.render('admin/writeReport',{cID});
});
app.post('/admin/complaint/:cID/discard',(req,res)=>{
	const {cID} = req.params;
	const {report} = req.body;
	// return res.send(report);
	const q='UPDATE complaints SET _status= 3, report = ? where id=?';
	connection.query(q,[report,cID],function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		return res.redirect('/admin/complaint/all');
	});
});

app.post('/admin/complaint/:cID/restore',(req,res)=>{
	const {cID} = req.params;
	const q='UPDATE complaints SET _status= 4 where id=?';
	connection.query(q,cID,function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		return res.redirect('/admin/complaint/all');
	});
})


// ERROR 404 ROUTE:----------------------------------------
app.get('*',(req,res)=>{
	res.render('PageNotFound');
})

