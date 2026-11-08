import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route below this line is protected
router.use(requireAuth);

// READ all my notes
router.get("/", async (req, res) => {
  const { data, error } = await req.supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREATE a note
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const { data, error } = await req.supabase
    .from("notes")
    .insert({ title, content, user_id: req.user.id })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// UPDATE a note
router.put("/:id", async (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const { data, error } = await req.supabase
    .from("notes")
    .update({ title, content })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    // PGRST116 = no row found (wrong id, or it belongs to someone else)
    if (error.code === "PGRST116") {
      return res.status(404).json({ error: "Note not found" });
    }
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
});

// DELETE a note
router.delete("/:id", async (req, res) => {
  const { data, error } = await req.supabase
    .from("notes")
    .delete()
    .eq("id", req.params.id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (data.length === 0) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json({ message: "Note deleted" });
});

export default router;