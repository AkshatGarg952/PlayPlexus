import express from 'express';
import connectDB from "./src/database/mongoose.js";
import userRouter from './src/features/users/user.routes.js';
import teamRouter from './src/features/teams/team.routes.js';
import requestRouter from './src/features/requests/request.routes.js';
import chatRouter from './src/features/chatbot/chatbot.routes.js';
import dotenv from 'dotenv';
import expressLayouts from "express-ejs-layouts";
import path from 'path';
import { fileURLToPath } from 'url';
import User from "./src/features/users/user.schema.js"
import Team from "./src/features/teams/team.schema.js"
import cookieParser from "cookie-parser";
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import Message from "./src/features/chats/chat.schema.js"
import {startExpiryJob} from "./src/features/requests/expiration.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.set('view engine', 'ejs'); 
app.use(expressLayouts);
app.use(cookieParser());
app.use('/api/users', userRouter);
app.use('/api/teams', teamRouter);
app.use('/api/requests', requestRouter);
app.use('/api/chatS', chatRouter);


app.get('/', (req, res)=>{
    res.render('Landpage',{layout:false, user:null, team:null})
    })

app.get('/LandPage/:id', async(req, res)=>{
    const id = req.params.id;
   
    const user = await User.findById(id);
    if(user){
        res.render('Landpage',{layout:false, user:user.username, team:null})
    }
    else{
        const team = await Team.findById(id);
        console.log(team);
        if(team){
        res.render('LandPage', {layout:false, user:null, team:team.email})
        }

        else{
            res.render('Landpage',{layout:false, user:null, team:null})
        }
    }

})


app.get('/mainPage/:type/:username/:email',async (req, res)=>{
    const type = req.params.type;
    const username = req.params.username;
    const email = req.params.email;
    if(type==="team"){
        const team = await Team.findOne({email:email})
        console.log(team);
        res.render('Dashboard', {layout:false, team:team, user:null});
    }
    else if(type==="user"){
        const user = await User.findOne({username:username});
        console.log(user);
        res.render('Dashboard', {layout:false, team:null, user:user});
    }
    else{
        res.render('Dashboard', {layout:false, team:null, user:null});
    }
});

app.get('/allPlayers/:uId/:tId', async (req, res)=>{
    const {uId, tId} = req.params;
    console.log(tId);
    console.log(uId);
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        res.render('User', {layout:false, user:user, team:null})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('User', {layout:false, user:null, team:team})
    } 
})

app.get('/allTeams/:uId/:tId', async (req, res)=>{
    const {uId, tId} = req.params;
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        res.render('Team', {layout:false, user:user, team:null})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('Team', {layout:false, user:null, team:team})
    } 
})

app.get('/allRequests/:uId/:tId', async (req, res)=>{
    const {uId, tId} = req.params;
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        res.render('Request', {layout:false, user:user, team:null})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('Request', {layout:false, user:null, team:team})
    } 
})

app.get('/allNewRequests/:uId/:tId', async (req, res)=>{
    const {uId, tId} = req.params;
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        res.render('NewRequests', {layout:false, user:user, team:null})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('NewRequests', {layout:false, user:null, team:team})
    } 
})

app.get('/profile/:uId/:tId', async (req, res)=>{
    const {uId, tId} = req.params;
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        res.render('Profile', {layout:false, user:user, team:null})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('Profile', {layout:false, user:null, team:team})
    } 
})

app.get('/filteredTeams/:uId/:tId/:play/:loca', async(req, res)=>{
    const {uId, tId, play, loca} = req.params;
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        console.log(user);
        res.render('Fteams', {layout:false, user:user, team:null, play:play, loca:loca})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('Fteams', {layout:false, user:null, team:team, play:play, loca:loca})
    } 
})

app.get('/filteredUsers/:uId/:tId/:play/:loca', async(req, res)=>{
    const {uId, tId, play, loca} = req.params;
    if(uId && mongoose.Types.ObjectId.isValid(uId)){
        const user = await User.findById(uId);
        res.render('FUser', {layout:false, user:user, team:null, play:play, loca:loca})
    }
    else if(tId){
        const team = await Team.findById(tId);
        res.render('FUser', {layout:false, user:null, team:team, play:play, loca:loca})
    } 
})


app.get('/chat1/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        console.log(senderId);
        console.log(receiverId);
        let sender = await User.findById(senderId);
        let receiver = await User.findById(receiverId);

        if(!sender){
            sender = await Team.findById(senderId);
        }
        if (!receiver) {
        receiver = await Team.findById(receiverId);
        }

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.render('Chat', {
            layout: false,
            sender: sender || null,
            receiver: receiver,
            messages: messages || []
        });
    } catch (error) {
        console.error('Error loading chat:', error);
        res.status(500).send('Server error');
    }
});


app.get('/chat2/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        console.log(senderId);
        console.log(receiverId);
        let sender = await User.findById(senderId);
        let receiver = await User.findById(receiverId);

        if(!sender){
            sender = await Team.findById(senderId);
        }
        if (!receiver) {
        receiver = await Team.findById(receiverId);
        }

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.render('Chat', {
            layout: false,
            sender: sender || null,
            receiver: receiver,
            messages: messages || []
        });
    } catch (error) {
        console.error('Error loading chat:', error);
        res.status(500).send('Server error');
    }
});

app.get('/logout', (req, res)=>{
    res.clearCookie("token", {
        httpOnly: true,
        secure: true, 
        sameSite: "Strict"
    });

    res.redirect("/");
})

app.get('/Error1', (req, res)=>{
    res.render('Error1', {layout:false});
})

app.get('/Error2', (req, res)=>{
    res.render('Error2', {layout:false});
})

app.get('/Error3', (req, res)=>{
    res.render('Error3', {layout:false});
})

app.get('/Error4', (req, res)=>{
    res.render('Error4', {layout:false});
})

app.get('/Error5', (req, res)=>{
    res.render('Error5', {layout:false});
})

app.get('/Error6', (req, res)=>{
    res.render('Error6', {layout:false});
})

app.get('/Error7', (req, res)=>{
    res.render('Error7', {layout:false});
})


// Socket Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Consider restricting this in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('New Socket.IO connection:', socket.id);

  socket.on('joinRoom', (roomId) => {
    if (!roomId || typeof roomId !== 'string') return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('sendMessage', async (message, senderId, receiverId, roomId) => {
    console.log('Received sendMessage:', { message, senderId, receiverId, roomId });
    try {
      if (!message || !senderId || !receiverId || !roomId) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }
      const sender = (await User.findById(senderId)) || (await Team.findById(senderId));
      const receiver = (await User.findById(receiverId)) || (await Team.findById(receiverId));
      if (!sender || !receiver) {
        socket.emit('error', { message: 'Sender or receiver not found' });
        return;
      }
      const m = new Message({ message, senderId, receiverId });
      await m.save();
      io.to(roomId).emit('receiveMessage', m);
      console.log('Emitted receiveMessage to room:', roomId);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Server error' });
    }
  });

    socket.on('requestAction', async ({ action, requestId: rId }) =>{
       if (action === 'accept') {
    const request = await Request.findById(rId);
    request.status = 'accepted';
    await request.save();
     io.emit('receive', {status: request.status,id: request._id});
  }

  else if(action === 'reject'){
    const request = await Request.findById(rId);
    request.status = 'rejected';
    await request.save();
     io.emit('receive', {status: request.status,id: request._id});
  }

  else if(action === 'cancel'){
    const request = await Request.findById(rId);
    request.status = 'cancelled';
    await request.save();
      io.emit('receive', {status: request.status, id: request._id});
  }


  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(process.env.PORT_NO, () => {
    connectDB();
    startExpiryJob();
    console.log("The server is listening at port no", process.env.DATABASE_URL);
    console.log("The server is listening at port no", process.env.PORT_NO);
});
