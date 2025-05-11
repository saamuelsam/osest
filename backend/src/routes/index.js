import express from "express";
const router = express.Router();

// ✅ ROTA DE TESTE
router.get("/ping", (req, res) => {
  return res.status(200).json({ message: "pong!" });
});

export default router;
