//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const _ = require("lodash");
const { result } = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-faraz:test123@cluster0.o0tkk9z.mongodb.net/ChecklistDB', { useNewUrlParser: true });




// creating schemas
const itemSchema = {
  name: String
};
const foldersSchema = {
  folder: String
}

const Item = mongoose.model("Item", itemSchema);
const Folder = mongoose.model("Folder", foldersSchema);

const item1 = new Item({
  name: "Welcome To : Check List "
})
const item2 = new Item({
  name: "Click '+' button to add Your list item "
})
const defaultItems = [item1, item2];
const listSchema = {
  name: String,
  item: [itemSchema]
}
const List = mongoose.model("List", listSchema)
// constand , variables , etc .. goes here



app.get("/", function (req, res) {

  Item.find({}, function (err, data) {
    if (data.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log("You have an error while inserting default item to database" + err);
        } else {
          console.log("Succesfully inserted default items to database");
        }
      })
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Home", newListItems: data});
    }
  })


});

app.post("/", function (req, res) {

  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  })

  if (listName === "Home") {
    item.save()
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundedLits) {
      foundedLits.item.push(item);
      foundedLits.save();
      res.redirect("/" + listName)
    });
  }
});
// when checked item is unchecked
app.post("/delete", (req, res) => {
  const checkboxId = req.body.checkbox;
  const listHeading = req.body.listHeading;

  if (listHeading === "Home") {
    Item.findByIdAndRemove(checkboxId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully Deleted Checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listHeading }, { $pull: { item: { _id: checkboxId } } }, function (err, foundedList) {
      if (!err) {
        res.redirect("/" + listHeading);
      }
    })
  }


});

// user typed url goes here

app.get("/:userListName", function (req, res) {

  const userListName = _.capitalize(req.params.userListName);

  List.findOne({ name: userListName }, function (err, foundedLits) {
    if (!err) {
      if (!foundedLits) {
        const list = new List({
          name: userListName,
          item: defaultItems
        });

        const savedUserList = list.name;
        Folder.findOne({ folder: userListName }, (err, founded) => {
          if (!err) {
            if (!founded) {

              const folder = new Folder({
                folder: userListName
              })
              folder.save();
              console.log("succesfully folder name saved to database");

            }
          }
        })



        Folder.findOneAndUpdate({ folder: "Favicon.ico" }, { folder: "Home" }, function (err, result) {
          if (!err) {
            console.log("succesfully updated favicon.ico to Home");
          }
        })

        list.save();
        res.redirect("/" + userListName);
      } else {

        res.render("list", { listTitle: userListName, newListItems: foundedLits.item});
      }


    }
  });






});


app.listen(process.env.PORT || 3000, function () {
  console.log("Server started succesfully ");
});
