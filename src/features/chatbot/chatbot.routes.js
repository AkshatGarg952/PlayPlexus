import express from "express";
import ask from "./chatbot.controller.js";
const chatRouter = express.Router();
import jwtAuth from "../../middleware/jwt.auth.js";


chatRouter.post("/ask/:uId/:tId",jwtAuth, (req,res)=>{
    ask(req, res);
});

export default chatRouter;
