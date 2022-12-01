const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");

// ROUTE 1 :Get all the notes using : Get "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured");
  }
});
// ROUTE 2: Add a new Note using: Post "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Do not leave title empty").isLength({ min: 1 }),
    body("description", "Do not leave description empty").isLength({
      min: 1,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //If there are errors , return Bad request and the error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

// ROUTE 3: Update an existing Note using: put "/api/notes/updatenote/:id". Login required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  // create a newNote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  // Find the note to be update and updated it
  let note = await Notes.findById(req.params.id);
  if (!note) {
    res.status(404).send("Not Found");
  }

  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }

  note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json({ note });
});

// ROUTE 4: Delete an existing Note using: delete "/api/notes/delete/:id". Login required

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  // Find the note to be deleted and delete it
  let note = await Notes.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not Found");
  };

  // Allow deletion only if user owns this note
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  };

  note = await Notes.findByIdAndDelete(
    req.params.id
  );
  res.json({"Success ":"Note has been deleted",note:note});
});
module.exports = router;
