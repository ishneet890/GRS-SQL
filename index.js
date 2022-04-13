require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const path=require('path');
const sql_password='pass';
const create_tables_query=require('./sql/create_tables');
const app = express();
const port=3000;
const passport = require('passport');
var session = require('express-session');
require('./passport-setup')
// --------------------------------------------------------
//SQL CONNECTION:
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password: 'pass',
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
app.use((req,res,next)=>{
	res.locals.curPath = req.path.split('/');
	next();
})
app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());
// --------------------------------------------------------

// --------------------------------------------------------
//ROUTES:

app.listen(port,()=>{
	console.log(`Port http://localhost:${port}/ open`);
})

app.get('/',(req,res)=>{
	const q = 'SELECT COUNT(*) AS count FROM users';
	const query = connection.query(q,function(error,results,fields){
		if(error)throw error;
		var totalUsers = (results[0].count);
		res.render('homepage',{totalUsers});
	})
})

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/google-redirect');
  }
);
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

app.get('/google-redirect', isLoggedIn, (req, res) => {

	email=req.user.emails[0].value
	pass_word='google'
	fName=req.user.given_name
	lName=req.user.family_name
	age=30
	occupation='student'
	gender='female'
	phone='1234567890'
	address='abc'

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
		const q= 'SELECT * FROM users WHERE email= ?';
		const query = connection.query(q,[email],function(error,results,fields){
		console.log(results);
		if(error)throw error;
		if(results.length >= 1)
		{
			//console.log("email id already exits!!");
			//res.status(400).json({error: "User with this email already exists"})
			res.redirect(`/user/${results[0].ID}/dashboard`);

		}
		else
		{
			connection.query('INSERT INTO users SET ?',user,function(error,results,fields){
				if(error)throw error;
				res.redirect(`/user/${results[0].id}/dashboard`);
			});
		}
	});
		
	}
	catch(err){
		console.log(err);
		res.redirect('/user/signup');
	}

	
})


app.get('/about',(req,res)=>{
	res.redirect('/');
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
		const q= 'SELECT * FROM users WHERE email= ?';
		const query = connection.query(q,[email],function(error,results,fields){
		console.log(results);
		if(error)throw error;
		if(results.length >= 1)
		{
			console.log("email id already exits!!");
			//res.status(400).json({error: "User with this email already exists"})
			return res.redirect('/user/signup');

		}
		else
		{
			connection.query('INSERT INTO users SET ?',user,function(error,results,fields){
				if(error)throw error;
				res.redirect('/user/login');
			});
		}
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
	const q = 'SELECT fName FROM users WHERE ID=?';
	connection.query(q,id,function(error,results,fields){
			if(error)throw error;
			res.render('user/dashboard',{id,fName:results[0].fName});
	});	
})

app.get('/department/codes',(req,res)=>{
	const q = 'SELECT * FROM department';
	connection.query(q,function(error,results,fields){
			if(error)throw error;
			// res.send(results);
			res.render('departmentCodes',{departments : results});
	});	
})

app.get('/user/:id/addComplaint',(req,res)=>{
	const {id} = req.params;
	const q = 'SELECT fName FROM users WHERE ID=?';
	connection.query(q,id,function(error,results,fields){
			if(error){
				return res.send(error);
			}
			res.render('user/addComplaint',{id,fName:results[0].fName});
	});		
})

app.post('/user/:id/addComplaint',(req,res)=>{
	const {areaCode,description,deptID,title} = req.body;
	const {id} = req.params;
	
	let newComplaint = {
		areaCode : areaCode,
		description : description,
		userID : id,
		deptID : deptID,
		title : title
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

app.get('/user/:id/allComplaints',(req,res)=>{
	const {id} = req.params;
	const q =`SELECT complaints.*,department.name AS dept,CONCAT(users.fName," ",users.lName) AS userName FROM complaints 
			  JOIN department ON complaints.deptID=department.ID 
			  JOIN users ON users.ID=complaints.userID;

		      SELECT fName FROM users WHERE ID=?;`;

	connection.query(q,[id,id],function(error,results,fields){
			if(error)throw error;
			res.render('user/allComplaints',{id,complaints:results[0],fName:results[1][0].fName});
	});	
})

app.get('/user/:id/myComplaints',(req,res)=>{
	const {id} = req.params;
	const q =`SELECT complaints.*,department.name AS dept,CONCAT(users.fName," ",users.lName) AS userName FROM complaints 
			  JOIN department ON complaints.deptID=department.ID 
			  JOIN users ON users.ID=complaints.userID
			  WHERE userID = ?;

		      SELECT fName FROM users WHERE ID=?;`;

	connection.query(q,[id,id],function(error,results,fields){
			if(error){
				return res.send(error);
			}
			res.render('user/myComplaints',{id,complaints:results[0],fName:results[1][0].fName});
	});	
})

app.get('/user/:uID/complaint/:cID',(req,res)=>{
	const {cID} = req.params;
	// const q = 'SELECT * FROM complaints WHERE ID = ?';
	const q= 'select complaints.*, department.name AS dept  from complaints join department on complaints.deptID = department.ID WHERE complaints.ID = ?'
	connection.query(q,cID,function(error,results,fields){
			if(error){
				res.send(error);
			}
			if(results.length==0){
				return res.send("Requested Complaint not found");
			}
			res.render('user/viewComplaint',{complaint:results[0]});
			// const str = `/user/${results[0].id}/dashboard`;
			// res.send(str);
			// res.redirect(`/user/${results[0].id}/dashboard`);
	});	
})
app.get('/user/:uID/complaint_delete/:cID',(req,res)=>{
	const {uID,cID}= req.params;
	const q = 'DELETE FROM complaints WHERE complaints.ID=?;';
	connection.query(q,cID,function(error,results,fields){
		if(error){
			return res.send(error);
		}
		res.redirect(`/user/${uID}/myComplaints`);
	});

});

// MUNICIPAL ROUTES:---------------------------------------
app.get('/municipal/login',(req,res)=>{	
	res.render('municipal/login')
});

app.post('/municipal/login',(req,res)=>{
	const {email,pass_word} = req.body;
	const q = 'SELECT * FROM municipal WHERE email = ? AND pass_word = ?';	
	connection.query(q,[email,pass_word],function(error,results,fields){
		if(error){
			res.send(error);
		}
		if(results.length==0){
			return res.redirect('/municipal/login');
		}
		res.redirect(`/municipal/${results[0].ID}/dashboard`);
	});
});

app.get('/municipal/:id/dashboard',(req,res)=>{
	const {id} = req.params;
	const q=`SELECT department.name AS dept,municipal.fName FROM municipal 
			 JOIN department ON department.ID=municipal.deptID
			 WHERE municipal.ID=?`;
	connection.query(q,id,function(error,results,fields){
		if(error){
			res.send(error);
		}
		res.render('municipal/dashboard',{id,dept:results[0].dept,fName:results[0].fName});
	});
});

app.get('/municipal/:id/myComplaints',(req,res)=>{
	const {id} = req.params;
	const q=`SELECT complaints.*,CONCAT(users.fName," ",users.lName) AS userName,department.name AS dept FROM municipal,complaints 
			 JOIN users ON complaints.userID=users.ID
			 JOIN department ON department.ID=complaints.deptID
			 WHERE complaints.deptID=municipal.deptID AND municipal.ID=?;

			 SELECT fName,department.name AS dept FROM municipal
			 JOIN department ON department.ID=municipal.deptID WHERE municipal.ID=?;`;

	connection.query(q,[id,id],function(error,results,fields){
		if(error){
			res.send(error);
		}
		res.render('municipal/myComplaints',{id,complaints:results[0],fName:results[1][0].fName,dept:results[1][0].dept});
	});
})

app.get('/municipal/:id/view',(req,res)=>{
	const {id} = req.params;
	// const q='SELECT * FROM complaints WHERE ID=?'
	const q='select complaints.*, department.name AS dept  from complaints join department on complaints.deptID = department.ID WHERE complaints.ID = ?'
	connection.query(q,id,function(error,results,fields){
			if(error){
				res.send(error);
			}
			if(results.length==0)return res.send('hola');
			res.render('municipal/viewComplaint',{complaint:results[0]});
	});
});

app.post('/municipal/:id/flag',(req,res)=>{
	const {id} = req.params;
	const q  = 'UPDATE complaints SET _status= 2 where id=?';
	connection.query(q,id,function(error,results,fields){
		if(error){
			res.send(error);
		}
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
		if(error){
			res.send(error);
		}
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
		if(error){
			res.send(error);
		}
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
				console.log(error.sqlMessage);
				return res.redirect('/admin/addMunicipal');
			}
			return res.redirect('/admin/dashboard');
		});
	}
	catch(err){
		console.log(err.message)
		return res.redirect('/admin/addMunicipal');
	}
})

app.get('/admin/flaggedComplaints',(req,res)=>{
	const q=`SELECT complaints.*,CONCAT(users.fName," ",users.lName) AS userName,department.name AS dept FROM complaints
			 JOIN users ON users.ID=complaints.userID
			 JOIN department ON department.ID=complaints.deptID
			 WHERE _status=2`;
	connection.query(q,function(error,results,fields){
		if(error){
			res.send(error);
		}
		res.render('admin/flaggedComplaints',{complaints : results})
	});
})

app.get('/admin/allComplaints',(req,res)=>{
	const q=`SELECT complaints.*,CONCAT(users.fName," ",users.lName) AS userName,department.name AS dept FROM complaints
			 JOIN users ON users.ID=complaints.userID
			 JOIN department ON department.ID=complaints.deptID`;
	connection.query(q,function(error,results,fields){
		if(error)throw error;
		res.render('admin/allComplaints',{complaints : results})
	});
})

app.get('/admin/complaint/:cID',(req,res)=>{
	const {cID} = req.params;
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
		return res.redirect('/admin/allComplaints');
	});
});

app.post('/admin/complaint/:cID/restore',(req,res)=>{
	const {cID} = req.params;
	const q='UPDATE complaints SET _status= 4 where id=?';
	connection.query(q,cID,function(error,results,fields){
		if(error){
			return res.send(error.sqlMessage);
		}
		return res.redirect('/admin/allComplaints');
	});
})


// ERROR 404 ROUTE:----------------------------------------
app.get('*',(req,res)=>{
	res.render('PageNotFound');
})

