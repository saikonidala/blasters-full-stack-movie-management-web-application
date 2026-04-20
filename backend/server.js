require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt=require('bcrypt')


const db = mysql.createConnection(process.env.DB_URL);


db.connect((error) => {
    if (error) {
        console.error("Database connection failed:", error);
        return;
    }
    console.log("Database connected successfully");
});

const app = express();
app.use(cors());
app.use(express.json());


//registration logic

app.post('/home',async (req,res)=>{
    
    const{username,email,password}=req.body
    
        const hashedpassword=await bcrypt.hash(password,10);
        console.log("user data:",{
            username,
            email,
            password,
            hashedpassword
        })
        db.query("insert into  logintable (user_name,email,passwords) values(?,?,?)",[username,email,hashedpassword],(err,result)=>{
             if(err){
            console.log(err)
            return res.status(409).json({message:"Username or Email already exist"})
        }
        else{
            res.status(200).json({message:"Registration Succesful"})
            console.log("okay")
        }
        })
         
})
//login code logic
app.post('/login',async (req,res)=>{
    console.log(req.body)
    const {username,password}=req.body; 
    let passcode='';

    db.query("select passwords from logintable where user_name=?",[username], async (err,result)=>{
         if(err){
            console.log(err)
        }
        if(result.length === 0){
            return res.status(404).json({message:"username not found"})
        }
        console.log(result);
        passcode=result[0]. passwords;
        const ismatch= await bcrypt.compare(password,passcode);
        console.log("password matched",ismatch)
        console.log(ismatch)
        if(ismatch){
                res.status(200).json({message:"Login succesfull"})
            return
        }
        else{
            res.status(401).json({message:"Invalid password"})
            return
        }
    })
})
//Retrive data by performing search operation
app.get("/search", (req, res) => {
    const searchmovie = req.query.movie || "";
    console.log("Search query:", searchmovie);

    const sql = "SELECT image, movie_name FROM movies WHERE movie_name LIKE ? order by movie_name";
    db.query(sql, [`%${searchmovie}%`], (err, result) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        console.log("DB results:", result);
        res.json(result);
    });
});

//Delete data
app.delete("/delete",(req,res)=>{
    const value=req.body.value;
    console.log(value);
    db.query("select movie_name from movies where movie_name=?",[value],(err,result)=>{
        if(err){
            console.log(err)
        }
        if(result.length>0){
            const movie_name=result[0].movie_name;
            db.query("delete from movies where movie_name=?",[movie_name],(err,result)=>{
                if(err){
                    console.log(err);
                }
                console.log("success")
                return res.status(200).json({message:"Movie delete succesfully"});
            })
            console.log(movie_name)
        }
        else{
            console.log("not found");
            return res.send({message:"Movie Not Found"});
        }

    })
});


//update movie name
app.patch("/updatemoviename",(req,res)=>{
    console.log(req.body);
    const moviename=req.body.movienamef;
    const upname=req.body.upname;
    db.query("update movies set movie_name=? where movie_name=?",[upname,moviename],(err,result)=>{
    if(err){
        console.log("error occured: "+err);
    }
    if(result.affectedRows>0){
        console.log("updated the value");
        res.status(200).json({message:"movie name updated succesfully.."});
    }else{
        res.status(404).json({message:"Movie Not Found"});
        console.log("Movie Not Found")
    }
    })
} )

//update movie poster on basis of movie name
app.patch("/updatemovieposter",(req,res)=>{
    console.log(req.body);
    const pmoviename=req.body.pmoviename;
    const upposter=req.body.upposter;
    db.query("update movies set image=? where movie_name=?",[upposter,pmoviename],(err,result)=>{
    if(err){
        console.log("error occured: "+err);
    }
    if(result.affectedRows>0){
        console.log("updated the poster");
        res.status(200).json({message:"movie poster updated succesfully.."});
    }else{
        res.status(404).json({message:"Movie Not Found"});
        console.log("Movie Not Found")
    }
    })
} )

// see all movies by genre
app.get("/searchall", (req, res) => {
  const genre = req.query.genre;
  db.query("SELECT image, movie_name FROM movies WHERE genre = ? order by movie_name", [genre], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    console.log("DB results:", result);
    res.json(result);
  });
});

//add movies

app.post("/addmovies",(req,res)=>{
    console.log(req.body);
    const moviename=req.body.moviename;
    const genre1=req.body.genre1;
    const mposter=req.body.mposter;
        db.query("insert into movies(movie_name,image,genre) values(?,?,?)",[moviename,mposter,genre1],(err,result)=>{
            if(err){
                return res.status(409).json({message:"Movie Name Already exists"});
            }
            res.status(200).json({message:"Movie Added Succesfully"});
        })
})

app.listen(process.env.PORT, () => {
    console.log("Server running");
});
