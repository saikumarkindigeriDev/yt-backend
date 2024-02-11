const express=require('express') 

const mysql=require('mysql2') 

const cors=require("cors") 

const jwt = require('jsonwebtoken');
const bcrypt=require('bcryptjs')

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

    /* host:'localhost',
    user:'root', 
    password:'',
    database:'youtubedb' */
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
          console.log('User already registered')
          
          res.status(409).json({ error: 'User already registered' });
        } else {
          
          const insertUserSql = 'INSERT INTO reusers (username, email, password) VALUES (?, ?,?)';
          const insertUserValues = [username, email, hashedPassword];
  
          pool.query(insertUserSql, insertUserValues, (err, results) => {
            if (err) {
              console.error('Error inserting user:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              console.log('Registered successfully');
              res.status(200).json({ message: 'Registered successfully' });
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
   
   
    if (results.length>0) {



    
        
       bcrypt.compare(password,results[0].password,(errpr,response)=>{
        if (error){
          console.log("Failed")
          return res.json({Error:"Failed"})
        }
        
        if (response){
          const data = results;
        
          const token = jwt.sign({ userId: data.id, username: data.username }, 'your_secret_key', { expiresIn: '24h' });
console.log({token})
          return res.status(200).json({token})
        }else{
          console.log("Password Didn't Match")
          return res.json({Error:"Password Didn't Match"})
        }

    
          
        
       })
       
      
        }else{
          console.log('User not found');
         return res.json("You are not registerd")
        }
  })

})

const PORT = process.env.PORT ||4000

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})