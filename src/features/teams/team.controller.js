import teamR from "./team.repository.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
const teamRepository = new teamR();
dotenv.config();
export default class teamC{

    async register(req, res){
      try{
        let {name, password,leader, phone, location, bio, email, sports, onlineGames} = req.body;
            
            if (sports && typeof sports === 'string') {
              sports =sports.split(',').map(item => item.trim());
          }

          if (onlineGames && typeof onlineGames === 'string') {
            onlineGames =onlineGames.split(',').map(item => item.trim());
        }

          const Team = {
            name:name,
            phone:phone,
            leader:leader,
            password:password,
            location:location,
            bio:bio,
            sports:sports,
            onlineGames:onlineGames,
            email:email,

        }
            if(req.file){
                const imageUrl = req.file.path;
                Team.logo = imageUrl
            }
        
        
          console.log(Team);
        const team = await teamRepository.register(Team);
        const token = jwt.sign({ id: team._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
                         
                     res.cookie("token", token, {
                        httpOnly: true, 
                        secure: true,
                        sameSite: "Strict", 
                    });
        res.redirect(`/mainPage/team/false/${team.email}`);
        }
        catch(err){
          if(err.message === "User already exists!"){
          res.redirect('/Error3')
          }
          else if(err.message==="Team with this name already exists!"){
            res.redirect('/Error6');
          }
          else{
            res.redirect('/Error5');
          }
        }
    }

    async login(req, res){
        const {email, password} = req.body;
        try{
          const team = await teamRepository.login(email,password);
          const token = jwt.sign({ id: team._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
                         
          res.cookie("token", token, {
             httpOnly: true, 
             secure: true,
             sameSite: "Strict", 
         });
res.redirect(`/mainPage/team/false/${team.email}`);
        }
        catch(err){
           if(err.message==="User not found! Please register first."){
            res.redirect('/Error1');
           }
           else{
            res.redirect('/Error2');
           }
           
        }
    }


    async getDetails(req, res){
        const id = req.params.id;
        try{
            const team = await teamRepository.details(id);
            res.status(201).send(team);
        }
        catch(err){
            res.status(400).send(err.message);
        }
    }


    async getAll(req, res){
        const teams = await teamRepository.getAll(req.params.id);
        res.status(201).send(teams);
    }

    async update(req, res){
        const id = req.params.id;
        try{
            const Team = {};
    if (req.body.name) Team.name = req.body.name;
    if (req.body.location) Team.location = req.body.location;
    if (req.body.leader) Team.leader = req.body.leader;
    if (req.body.bio) Team.bio = req.body.bio;
    if (req.body.phone) Team.phone = req.body.phone;
    if (req.body.sports && typeof req.body.sports === 'string'){ 
      req.body.sports = req.body.sports.split(',').map(item => item.trim());
      Team.sports = req.body.sports;
    }
    if (req.body.onlineGames && typeof req.body.onlineGames === 'string') {
      req.body.onlineGames = req.body.onlineGames.split(',').map(item => item.trim());
      Team.onlineGames = req.body.onlineGames;
    }
    if (req.body.password) {
    Team.password = req.body.password; 
    }
    if (req.file && req.file.path) {
      Team.logo = req.file.path;
    }
    const newTeam = await teamRepository.update(id,Team);
    res.redirect(`/profile/null/${newTeam._id}`);
        }

        catch(err){
            console.log(err.message);
            res.status(401).send(err.message);
        }

    }

    async filterByLocation(req, res){
        try{
          const teams = await teamRepository.filterByLocation(req.params.location);
          res.status(201).send(teams);
        }

        catch(err){
          res.status(500).send(err.message);
        }
    }

    async filter(req, res){
        try{
            const teams = await teamRepository.filter(req.params.sport, req.params.loca, req.params.id);
            console.log(teams);
            res.status(201).send(teams);
          }
  
          catch(err){
            res.status(500).send(err.message);
          }
    }



}