const express = require("express");
const ProductManager = require("./ProductManager");

const app = express();
const PORT = 3000;
const manager = new ProductManager();

app.use(express.json());

// Ruta GET /products
app.get("/products", async (req, res) => {
  const products = await manager.getProducts();
  res.json({ products });
});

// Ruta GET /products/:pid
app.get("/products/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  const product = await manager.getProductById(id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

// Ruta POST /products

app.post("/products", async (req, res) => {
  const product = req.body;

  // Validación básica
  if (!product.title || !product.price || !product.description) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const newProduct = await manager.addProduct(product);
  res.status(201).json(newProduct);
});

// Ruta PUT /products/:pid
app.put("/products/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  const updatedFields = req.body;

  const updatedProduct = await manager.updateProduct(id, updatedFields);

  if (updatedProduct) {
    res.json(updatedProduct);
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

// Ruta DELETE /products/:pid
app.delete("/products/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);

  const deleted = await manager.deleteProduct(id);

  if (deleted) {
    res.json({ message: `Producto con id ${id} eliminado` });
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
