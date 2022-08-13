const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); 
 
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema ={
    name : String
}
const Item = mongoose.model("Item",itemSchema);

const item1= new Item({
    name : "box"
})
const item2= new Item({
    name : "tea"
})
 const defaultItems=[item1,item2];
 const listSchema={
    name : String,
    item : [itemSchema]
 }
 const List = mongoose.model("List",listSchema);
app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
    
        if(foundItems.length ===0){
                Item.insertMany(defaultItems,function(err){
                if(err)
                console.log(err);
                else
                console.log("SUccessfully inserted")
            })
            res.redirect("/");
        }
        else
        res.render("list",{listTitle: "TODAY", newListItems: foundItems})
    })
})

app.post("/",function(req,res){
    const itemName =req.body.newItem;
    const listName = req.body.list;
    if(itemName.length)
    {
        const itemN = new Item({
            name: itemName
        });
        if(listName === "TODAY"){
        itemN.save();
        res.redirect("/");
        }
        else{
            List.findOne({name: listName}, function(err,foundList){
                    foundList.item.push(itemN);
                    foundList.save();
                    res.redirect("/" +  listName);
            })
        }
    }
    else
    res.redirect("/"+listName);
})

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    console.log(listName);
    if (listName === "TODAY") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
        console.log("delllll")
      List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
  
  
  });
app.get("/:param",function(req,res){
   const custListName=req.params.param;
   List.findOne({name : custListName},function(err,foundList){
    if(!err)
    {
        if(foundList)
        {
            res.render("list",{listTitle: foundList.name ,newListItems: foundList.item})
        }
        else{
            const list = new List ({
                name : custListName,
                item : defaultItems
               })
               list.save();
               res.redirect("/"+custListName)
        }
    }
   })
})

app.post("/download",function(request,response){
    const custListName = request.body.list;
    if(custListName === "TODAY")
    {
        console.log(custListName)
        console.log(Item);
        Item.find({},function(err,foundItems){
            if(foundItems.length ===0){
                     console.log("Successfully inserted")
            }
            else
            {
                console.log(foundItems);
                let ans="";
                    var count =1;
                    for(var i=0;i<foundItems.length;i++)
                    {
                        ans=ans+count.toString()+'. '+foundItems[i].name+"\n";
                        count++;
                    }  
                    const fileData=ans
                    const fileName = custListName+'.txt'
                    const fileType = 'text/plain'
                    
                    response.writeHead(200, {
                        'Content-Disposition': `attachment; filename="${fileName}"`,
                        'Content-Type': fileType,
                        })
    
                    const download = Buffer.from(fileData)
                    response.end(download)
                    response.redirect('/');
            }
        })
    }
    else
    {
        List.findOne({name : custListName},function(err,foundList){
            if(!err)
            {
                if(foundList)
                {
                    let ans="";
                    var count =1;
                    for(var i=0;i<foundList.item.length;i++)
                    {
                        ans=ans+count.toString()+'. '+foundList.item[i].name+"\n";
                        count++;
                    }
                    const fileData=ans
                    const fileName = custListName+'.txt'
                    const fileType = 'text/plain'
                    
                    response.writeHead(200, {
                        'Content-Disposition': `attachment; filename="${fileName}"`,
                        'Content-Type': fileType,
                        })
    
                    const download = Buffer.from(fileData)
                    response.end(download)
                }
            }
        })
    }
})

app.get("/about",function(req,res){
    res.render("about")
})

app.listen(3000,function(){
    console.log("server is at port 3000")
})