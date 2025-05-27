const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "products.json");

class ProductManager {
  constructor() {
    this.file = filePath;
  }

  async addProduct(product) {
    const products = await this.getProducts();
    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const newProduct = { id: newId, ...product };
    products.push(newProduct);
    await fs.writeFile(this.file, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.file, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((prod) => prod.id === id);
  }
  // metodo para actualizar un producto por id
  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex((prod) => prod.id === id);

    if (index === -1) {
      return null; // Producto no encontrado
    }

    // No permitir cambiar el id
    if ("id" in updatedFields) {
      delete updatedFields.id;
    }

    products[index] = { ...products[index], ...updatedFields };

    await fs.writeFile(this.file, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const index = products.findIndex((prod) => prod.id === id);

    if (index === -1) {
      return false; // No encontrado
    }

    products.splice(index, 1); // Eliminar producto
    await fs.writeFile(this.file, JSON.stringify(products, null, 2));
    return true;
  }
}

module.exports = ProductManager;
