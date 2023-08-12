//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _  = require("lodash");
const mongoose = require('mongoose');
require("dotenv").config();

const app = express();
const mUrl = process.env.MONGOOSE_URL;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(`${mUrl}toDoListDB`,{useNewUrlParser: true});

const itemSchema =  mongoose.Schema({
  name:String
})

const ItemModel =  mongoose.model("Item",itemSchema);

const item1 = new ItemModel({
  name:"Welcome to to do list"
})

const item2 = new ItemModel({
  name:"Hit + to add item"
})

const item3 = new ItemModel({
  name:"Write your items"
})
const defaultItems = [item1,item2,item3];

const topicSchema =  mongoose.Schema({
  name:String,
  topItems : [itemSchema]
})

const TopicModel = new mongoose.model("topic",topicSchema)

app.get("/",  function(req, res) {

  ItemModel.find()
  .then((i)=>{
    if(i.length === 0){
      ItemModel.insertMany(defaultItems)
      .then(()=>{
        console.log("Success")
      })
      .catch((e)=>{
        console.log(e);
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems : i});
    }
  })
  .catch((e)=>{
    console.log(e);
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const newList = req.body.list;
  const itemNew = new ItemModel({
    name:itemName
  })
  if(newList === "Today"){
    itemNew.save()
    res.redirect("/")
  }
  else{
    TopicModel.findOne({name:newList})
    .then((i)=>{
      i.topItems.push(itemNew);
      i.save();
      res.redirect("/" + newList);
    });
  }
  
});

app.get("/:topic" ,async (req,res)=>{
  //console.log(req.params.topic)
  const tn = _.capitalize(req.params.topic);
  await TopicModel.findOne({name:tn})
  .then((t)=>{
    if(!t){
      //console.log("Dosen't exist")
      const topicNew = new TopicModel({
        name:tn,
        topItems:defaultItems
      });
      topicNew.save();
      res.redirect("/" + req.params.topic);
    }
    else{
      //console.log("Exist")
        res.render("list",{listTitle: t.name, newListItems : t.topItems})
    }
  })
  

})

app.post("/delete",(req,res)=>{
  const data = req.body.checkbox;
  const ListName = req.body.ListName;
  if(ListName === "Today"){
    ItemModel.deleteOne({_id:data})
    .then(()=>{
      console.log("deleted")
    })
    .catch((e)=>{
      console.log(e)
    })
  res.redirect("/")
  }
  else{
    TopicModel.findOneAndUpdate({name:ListName},{$pull:{topItems:{_id:data}}})
    .then(()=>{
      res.redirect("/"+ListName);
    })
  }
  
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
