class ImageCompressor {
    static async compress(file, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Iniciando compresión de imagen:', file.name);
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = function() {
                    try {
                        const { maxWidth = 800, maxHeight = 800, quality = 0.8 } = options;
                        
                        let { width, height } = img;
                        console.log('Dimensiones originales:', width, 'x', height);
                        
                        // Calcular nuevas dimensiones manteniendo proporción
                        if (width > height) {
                            if (width > maxWidth) {
                                height = (height * maxWidth) / width;
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = (width * maxHeight) / height;
                                height = maxHeight;
                            }
                        }
                        
                        console.log('Nuevas dimensiones:', width, 'x', height);
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Configurar contexto para mejor calidad
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        
                        // Dibujar imagen redimensionada
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convertir a blob
                        canvas.toBlob((blob) => {
                            if (blob) {
                                console.log('Imagen comprimida exitosamente. Tamaño final:', blob.size);
                                resolve(blob);
                            } else {
                                reject(new Error('Error al crear blob de imagen'));
                            }
                        }, 'image/jpeg', quality);
                        
                    } catch (error) {
                        console.error('Error durante la compresión:', error);
                        reject(error);
                    }
                };
                
                // ...existing code...
                                    img.onerror = function(error) {
                                        console.error('Error al cargar imagen:', error);
                                        reject(new Error('Error al cargar imagen'));
                                    };
                    
                                    // Leer archivo como DataURL
                                    const reader = new FileReader();
                                    reader.onload = function(e) {
                                        img.src = e.target.result;
                                    };
                                    reader.onerror = function(error) {
                                        console.error('Error al leer archivo:', error);
                                        reject(new Error('Error al leer archivo de imagen'));
                                    };
                                    reader.readAsDataURL(file);
                    
                                } catch (error) {
                                    console.error('Error inesperado:', error);
                                    reject(error);
                                }
                            });
                        }
                    }
                    // ...existing code...