const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const _ = require('lodash');

const mongoose = require("mongoose");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
mongoose.connect('mongodb+srv://admin-preethi:aijbkj@cluster0.v5hde.mongodb.net/todolistDB',
 {
     useNewUrlParser: true,
     useUnifiedTopology: true
 });
 const itemsSchema = {
     item_name : String
 };

 const Item = mongoose.model("item" , itemsSchema);
 const item1 = new Item({
     item_name : "Welcome ToDo List"
 });

 const item2 = new Item({
     item_name : "Hit the + button to add the new item"
 })

const defaultDB = [item1 , item2];
const listSchema = {
    name : String,
    items : [itemsSchema]
}
const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){

    Item.find({},function(err,foundItem)
    {
        if(err)
        {
            console.log(err);
        }
        if(foundItem.length === 0)
        {

         Item.insertMany(defaultDB).then(function(){
         console.log("Data inserted")  // Success
         }).catch(function(error){
        console.log(error)      // Failure
          });
          
          res.redirect("/");

        }
        res.render('index', 
        {name: "Today" , newitems : foundItem}
        );
    })
     
    
})
app.get('/:customeListName',function(req,res)
{
  const customListName = _.capitalize(req.params.customeListName);
  List.findOne({name: customListName}, function(err,foundList)
  {
      if(!err)
      {
          if(!foundList)
          {
                const list = new List({
                name : customListName,
                items : defaultDB
            })
            list.save();
            res.redirect('/'+customListName);
          }else{
    
            res.render('index',{name: foundList.name , newitems : foundList.items})

          }
      }
  })
 
})


app.get('/about',function(req,res)
{
    res.render('about');

})
app.post('/',function(req , res)
{
    const new_item = req.body.new_item;
    const listName = req.body.list;
    const item = new Item({ item_name : new_item});
    if(listName === "Today")
    {
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName},function(err,foundList)
        {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }


    
   
       
})
app.post('/delete',function(req,res)
{
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today")
    {
        Item.findByIdAndRemove(checkedItem,function(err)
        {
          if(!err)
          {
              console.log("Delete Successfully");
              res.redirect("/");
          }
        })
    }else{
        List.findOneAndUpdate({name: listName} ,{$pull: {items : {_id : checkedItem}}} ,
            function(err)
            {
               if(!err)
               {
                     res.redirect("/"+listName)
               }
            })
    }
   
   
})

app.listen(3000,function()
{
    console.log("Server is running");
});