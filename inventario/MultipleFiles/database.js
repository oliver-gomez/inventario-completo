class InventoryDB {
    constructor() {
        this.dbName = 'InventoryDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            console.log('Iniciando IndexedDB...');
            
            // Verificar si IndexedDB está disponible
            if (!window.indexedDB) {
                const error = 'IndexedDB no está disponible en este navegador';
                console.error(error);
                reject(new Error(error));
                return;
            }

            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                const error = `Error al abrir IndexedDB: ${event.target.error}`;
                console.error(error);
                reject(new Error(error));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB inicializada correctamente');
                
                // Manejar errores de la base de datos después de abrirla
                this.db.onerror = (event) => {
                    console.error('Error en la base de datos:', event.target.error);
                };

                resolve();
            };

            request.onupgradeneeded = (event) => {
                console.log('Actualizando estructura de la base de datos...');
                this.db = event.target.result;

                try {
                    // Crear Object Store para productos
                    if (!this.db.objectStoreNames.contains('products')) {
                        const productStore = this.db.createObjectStore('products', { keyPath: 'id' });
                        productStore.createIndex('name', 'name', { unique: false });
                        productStore.createIndex('categoryId', 'categoryId', { unique: false });
                        productStore.createIndex('createdAt', 'createdAt', { unique: false });
                        console.log('Object Store "products" creado');
                    }

                    // Crear Object Store para categorías
                    if (!this.db.objectStoreNames.contains('categories')) {
                        const categoryStore = this.db.createObjectStore('categories', { keyPath: 'id' });
                        categoryStore.createIndex('name', 'name', { unique: false });
                        console.log('Object Store "categories" creado');
                    }

                    // Crear Object Store para imágenes
                    if (!this.db.objectStoreNames.contains('images')) {
                        const imageStore = this.db.createObjectStore('images', { keyPath: 'id' });
                        imageStore.createIndex('productId', 'productId', { unique: false });
                        console.log('Object Store "images" creado');
                    }

                    // Crear Object Store para configuraciones
                    if (!this.db.objectStoreNames.contains('settings')) {
                        const settingsStore = this.db.createObjectStore('settings', { keyPath: 'key' });
                        console.log('Object Store "settings" creado');
                    }

                    console.log('Estructura de base de datos actualizada correctamente');
                } catch (error) {
                    console.error('Error al crear Object Stores:', error);
                    reject(error);
                }
            };
        });
    }

    // Método auxiliar para verificar si la DB está inicializada
    _checkDB() {
        if (!this.db) {
            throw new Error('Base de datos no inicializada. Llama a init() primero.');
        }
    }

    // PRODUCTOS
    async addProduct(product) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const request = store.add(product);

            request.onsuccess = () => {
                console.log('Producto agregado:', product.name);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error al agregar producto:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async updateProduct(product) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const request = store.put(product);

            request.onsuccess = () => {
                console.log('Producto actualizado:', product.name);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error al actualizar producto:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async deleteProduct(id) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'images'], 'readwrite');
            const productStore = transaction.objectStore('products');
            const imageStore = transaction.objectStore('images');

            // Eliminar producto
            const deleteProductRequest = productStore.delete(id);
            
            // Eliminar imagen asociada
            const deleteImageRequest = imageStore.delete(`product_${id}`);

            transaction.oncomplete = () => {
                console.log('Producto e imagen eliminados:', id);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error('Error al eliminar producto:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getAllProducts() {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (event) => {
                console.error('Error al obtener productos:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // CATEGORÍAS
    async addCategory(category) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.add(category);

            request.onsuccess = () => {
                console.log('Categoría agregada:', category.name);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error al agregar categoría:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async deleteCategory(id) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Categoría eliminada:', id);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error al eliminar categoría:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getAllCategories() {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (event) => {
                console.error('Error al obtener categorías:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // IMÁGENES
    async saveImage(productId, imageBlob, thumbnail = null) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            
            const imageData = {
                id: `product_${productId}`,
                productId: productId,
                main: imageBlob,
                thumbnail: thumbnail,
                createdAt: new Date().toISOString()
            };

            const request = store.put(imageData);

            request.onsuccess = () => {
                console.log('Imagen guardada para producto:', productId);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error al guardar imagen:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getImage(productId) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            const request = store.get(`product_${productId}`);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = (event) => {
                console.error('Error al obtener imagen:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // CONFIGURACIONES
    async saveSetting(key, value) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key: key, value: value });

            request.onsuccess = () => {
                console.log('Configuración guardada:', key);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error al guardar configuración:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getSetting(key) {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = (event) => {
                console.error('Error al obtener configuración:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getAllSettings() {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();

            request.onsuccess = () => {
                const settings = {};
                request.result.forEach(item => {
                    settings[item.key] = item.value;
                });
                resolve(settings);
            };

            request.onerror = (event) => {
                console.error('Error al obtener todas las configuraciones:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // UTILIDADES
    async clearAllData() {
        this._checkDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'categories', 'images', 'settings'], 'readwrite');
            
            const promises = [
                transaction.objectStore('products').clear(),
                transaction.objectStore('categories').clear(),
                transaction.objectStore('images').clear(),
                transaction.objectStore('settings').clear()
            ];

            transaction.oncomplete = () => {
                console.log('Todos los datos eliminados');
                resolve();
            };

            transaction.onerror = (event) => {
                console.error('Error al limpiar datos:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async exportAllData() {
        this._checkDB();
        try {
            const [products, categories, settings] = await Promise.all([
                this.getAllProducts(),
                this.getAllCategories(),
                this.getAllSettings()
            ]);

            return {
                products,
                categories,
                settings,
                exportDate: new Date().toISOString(),
                version: this.version
            };
        } catch (error) {
            console.error('Error al exportar datos:', error);
            throw error;
        }
    }

    async getStorageUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    used: estimate.usage,
                    available: estimate.quota,
                    percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
                };
            } catch (error) {
                console.warn('No se pudo obtener información de almacenamiento:', error);
                return null;
            }
        }
        return null;
    }
}

// Crear instancia global
const inventoryDB = new InventoryDB();

// Exportar para uso en módulos (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryDB;
}