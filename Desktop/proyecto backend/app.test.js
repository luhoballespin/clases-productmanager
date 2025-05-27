//test de las rutas de la app
const request = require("supertest");
const express = require("express");
const ProductManager = require("./ProductManager");
const app = express();
const manager = new ProductManager();
app.use(express.json());

// Mock the ProductManager methods
jest.mock("./ProductManager");
manager.getProducts = jest.fn();
manager.getProductById = jest.fn();
manager.addProduct = jest.fn();
manager.updateProduct = jest.fn();
manager.deleteProduct = jest.fn();

// Rutas (copiadas de app.js)
app.get("/products", async (req, res) => {
  const products = await manager.getProducts();
  res.json({ products });
});
app.get("/products/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  const product = await manager.getProductById(id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});
app.post("/products", async (req, res) => {
  const product = req.body;
  if (!product.title || !product.price || !product.description) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  const newProduct = await manager.addProduct(product);
  res.status(201).json(newProduct);
});
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
app.delete("/products/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  const deleted = await manager.deleteProduct(id);
  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

// TESTS
describe("Rutas de productos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /products devuelve lista de productos", async () => {
    const fakeProducts = [
      { id: 1, title: "A", price: 10, description: "desc" },
    ];
    manager.getProducts.mockResolvedValue(fakeProducts);

    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.products).toEqual(fakeProducts);
  });

  test("GET /products/:pid devuelve un producto existente", async () => {
    const fakeProduct = { id: 1, title: "A", price: 10, description: "desc" };
    manager.getProductById.mockResolvedValue(fakeProduct);

    const res = await request(app).get("/products/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakeProduct);
  });

  test("GET /products/:pid devuelve 404 si no existe", async () => {
    manager.getProductById.mockResolvedValue(undefined);

    const res = await request(app).get("/products/999");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Producto no encontrado");
  });

  test("POST /products crea un producto correctamente", async () => {
    const newProduct = { title: "Nuevo", price: 20, description: "desc" };
    const createdProduct = { id: 2, ...newProduct };
    manager.addProduct.mockResolvedValue(createdProduct);

    const res = await request(app).post("/products").send(newProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(createdProduct);
  });

  test("POST /products devuelve 400 si faltan campos", async () => {
    const res = await request(app)
      .post("/products")
      .send({ title: "Falta", price: 10 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Faltan campos requeridos");
  });

  test("PUT /products/:pid actualiza un producto existente", async () => {
    const updated = {
      id: 1,
      title: "Modificado",
      price: 30,
      description: "desc",
    };
    manager.updateProduct.mockResolvedValue(updated);

    const res = await request(app)
      .put("/products/1")
      .send({ title: "Modificado" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(updated);
  });

  test("PUT /products/:pid devuelve 404 si no existe", async () => {
    manager.updateProduct.mockResolvedValue(undefined);

    const res = await request(app).put("/products/999").send({ title: "Nada" });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Producto no encontrado");
  });

  test("DELETE /products/:pid elimina un producto existente", async () => {
    manager.deleteProduct.mockResolvedValue(true);

    const res = await request(app).delete("/products/1");
    expect(res.statusCode).toBe(204);
  });

  test("DELETE /products/:pid devuelve 404 si no existe", async () => {
    manager.deleteProduct.mockResolvedValue(false);

    const res = await request(app).delete("/products/999");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Producto no encontrado");
  });
});

// Se recomienda instalar una extensión para ejecutar pruebas jest.
