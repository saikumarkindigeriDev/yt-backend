const express=require('express') 

const mysql=require('mysql2') 

const cors=require("cors") 

const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt')

const app=express() 

app.use(cors());

require('dotenv').config()

app.use(express.urlencoded({extended: false}))
app.use(express.json())


const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, conn) => {
    if(err) console.log(err)
    console.log("Connected successfully")
})

app.get("/",(req,res)=>{
    res.send("Hi Sai")
})




app.post('/register', async(req, res) => {
    const { username, email, password ,confirmPassword} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    
    const checkUserSql = `SELECT * FROM reusers WHERE username =?   LIMIT 1`;
   const value=[username]
  
    pool.query(checkUserSql,value, (err, results) => {
      if (err) {
        console.error('Error checking user existence:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          
          res.status(409).json({ error: 'User already registered' });
        } else {
          
          const insertUserSql = 'INSERT INTO reusers (username, email, password) VALUES (?, ?,?)';
          const insertUserValues = [username, email, hashedPassword];
  
          pool.query(insertUserSql, insertUserValues, (err, results) => {
            if (err) {
              console.error('Error inserting user:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              console.log('User registered successfully');
              res.status(200).json({ message: 'User registered successfully' });
            }
          });
        }
      }
    });
  });
  
  app.post('/login',(req,res)=>{

    const {username,password}=req.body
    const query = 'SELECT * FROM reusers WHERE username = ? ';
  const values = [username]

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
    
      return;
    }
    console.log(results[0])
    const data = results;
    console.log(data)
    const token = jwt.sign({ userId: data.id, username: data.username }, 'your_secret_key', { expiresIn: '24h' });
    if (data) {
        
        const isPasswordMatched=bcrypt.compare(password,data.password) 
        if (isPasswordMatched){
            console.log("Password Matched")

            

    
            return res.status(200).json({token})

           
        }else{ 
            console.log("Password didn't Matched")
            return res.json("Password didn't Matched")
           
        }
     
       
      
        }else{
          console.log('User not found');
         return res.json("You are not registerd")
        }
  })

})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log("Server is running....")
})