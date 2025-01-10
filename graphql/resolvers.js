import { GraphQLScalarType, Kind } from 'graphql';
import products from '../data/products.json' assert { type: 'json' };
import categories from '../data/categories.json' assert { type: 'json' };
import suppliers from '../data/suppliers.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';
import saveToFile  from '../saveToFile.js';


// Scalar dla obsługi numerów telefonów
const PhoneNumber = new GraphQLScalarType({
  name: 'PhoneNumber',
  description: 'Custom scalar for phone numbers (9 digits only)',

  // Zwracanie wartości w odpowiedzi (z backendu do klienta)
  serialize(value) {
    if (typeof value !== 'string' || !/^\d{9}$/.test(value)) {
      throw new Error('PhoneNumber must be a string consisting of exactly 9 digits.');
    }
    return value;
  },

  // Walidacja danych wejściowych (z klienta do backendu)
  parseValue(value) {
    if (typeof value !== 'string' || !/^\d{9}$/.test(value)) {
      throw new Error('PhoneNumber must be a string consisting of exactly 9 digits.');
    }
    return value;
  },

  // Walidacja danych przy przesyłaniu jako literał w GraphQL
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING || !/^\d{9}$/.test(ast.value)) {
      throw new Error('PhoneNumber must be a string consisting of exactly 9 digits.');
    }
    return ast.value;
  },
});

const NutritionalValue = new GraphQLScalarType({
    name: 'NutritionalValue',
    description: 'Custom scalar for validating  nutritional values ( float / int)',

    serialize(value){
      if(typeof value !== 'number'){
        throw new Error('NutritionalValue must be a number (Float or Int).');
      }
      return value;
    },

    parseValue(value){
      if(typeof value !== 'number'){
        throw new Error('NutritionalValue must be a number (Float or Int).');
      }
      return value;
    },

    parseLiteral(ast){
      if(ast.kind !== Kind.FLOAT && ast.kind !== Kind.INT){
        throw new Error('NutritionalValue must be a number (Float or Int).');
      }
      return parseFloat(ast.value);
    }

});

const resolvers = {
  PhoneNumber, // scalar sprawdzajacy czy numer ma 9 cyfr 
  NutritionalValue, // scalar sprawdzajacy czy wartosci odzywcze produktu sa liczba 
  Query: {
    products: (_, { filter, limit, offset, sortBy, sortOrder }) => {
      let filteredProducts = products;
    
      // Filtrowanie po nazwie (zawiera)
      if (filter?.name) {
        filteredProducts = filteredProducts.filter(p =>
          p.name.includes(filter.name)
        );
      }

      // Filtorwanie po nazwie ktora nie zawiera
      if (filter?.name_not_contains) {
        filteredProducts = filteredProducts.filter(p =>
          !p.name.toLowerCase().includes(filter.name_not_contains.toLowerCase())
        );
      }

      // Filtorwanie po ciagu znaków wpisanych 
      if (filter?.name_extract_contains) {
        filteredProducts = filteredProducts.filter(p =>
          p.name === filter.name_extract_contains
        );
      }

      // Filtorwanie po ciagu znaków nie rownych 
      if(filter?.name_not_equals){
        filteredProducts = filteredProducts.filter(p =>
          p.name !== filter.name_not_equals
        );
      }
    
      // Filtrowanie po kategorii
      if (filter?.category_id) {
        filteredProducts = filteredProducts.filter(
          p => p.category_id === parseInt(filter.category_id, 10)
        );
      }
    
      // Filtrowanie po ID dostawcy
      if (filter?.supplier_id) {
        filteredProducts = filteredProducts.filter(
          p => p.id_supplier === parseInt(filter.supplier_id, 10)
        );
      }
    
      // Filtrowanie po węglowodanach
      if (filter?.min_carbohydrates) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.carbohydrates >= filter.min_carbohydrates
        );
      }
      if (filter?.max_carbohydrates) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.carbohydrates <= filter.max_carbohydrates
        );
      }
    
      // Filtrowanie po białkach
      if (filter?.min_proteins) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.proteins >= filter.min_proteins
        );
      }
      if (filter?.max_proteins) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.proteins <= filter.max_proteins
        );
      }
    
      // Filtrowanie po tłuszczach
      if (filter?.min_fats) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.fats >= filter.min_fats
        );
      }
      if (filter?.max_fats) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.fats <= filter.max_fats
        );
      }

      //Filtorwanie wyników rownych liczbie 

      if (filter?.carbohydrates_equals !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.carbohydrates === filter.carbohydrates_equals
        );
      }
      if (filter?.protein_equals !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.proteins === filter.protein_equals
        );
      }
      if (filter?.fats_equals !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.nutritional_values.fats === filter.fats_equals
        );
      }
    
      // Filtrowanie po ratingu dostawcy
      if (filter?.min_rating || filter?.max_rating) {
        filteredProducts = filteredProducts.filter(product => {
          const supplier = suppliers.find(s => s.id_supplier === product.id_supplier);
          if (!supplier) return false; // Jeśli dostawca nie istnieje, pomiń produkt
          const rating = supplier.rating;
          if (filter.min_rating && rating < filter.min_rating) return false;
          if (filter.max_rating && rating > filter.max_rating) return false;
          return true;
        });
      }
    
      // Sortowanie
      if (sortBy) {
        filteredProducts.sort((a, b) => {
          let aValue = a;
          let bValue = b;
      
          // Obsługa zagnieżdżonych pól 
          if (sortBy.includes(".")) {
            const keys = sortBy.split(".");
            aValue = keys.reduce((obj, key) => (obj ? obj[key] : undefined), a);
            bValue = keys.reduce((obj, key) => (obj ? obj[key] : undefined), b);
          } else {
            aValue = a[sortBy];
            bValue = b[sortBy];
          }
      
          if (aValue === undefined || bValue === undefined) return 0;
          return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
        });
      }
    
      // Paginacja i offset
      if (offset != null && limit != null) {
        // Jeśli podano zarówno offset, jak i limit
        filteredProducts = filteredProducts.slice(offset, offset + limit);
      } else if (offset != null) {
        // Jeśli podano tylko offset
        filteredProducts = filteredProducts.slice(offset);
      } else if (limit != null) {
        // Jeśli podano tylko limit
        filteredProducts = filteredProducts.slice(0, limit);
      }
    
      return filteredProducts;
    },

    product: (_, { id }) => {
      const product = products.find(p => p.id === parseInt(id, 10));
      if (!product) {
        throw new Error(`Product with ID ${id} not found.`);
      }
      return product;
    },

    supplier: (_, { id_supplier }) => {
      
      const supplier = suppliers.find(s => s.id_supplier === parseInt(id_supplier, 10));
      if (!supplier) {
        throw new Error(`Supplier with ID ${id_supplier} not found.`);
      }
      return supplier;
    },

    suppliers: (_, { filter, limit, offset, sortBy, sortOrder }) => {
      let filteredSuppliers = suppliers;
    
      // Filtrowanie po minimalnym ratingu
      if (filter?.min_rating != null) {
        filteredSuppliers = filteredSuppliers.filter(
          s => s.rating >= filter.min_rating
        );
      }
    
      // Filtrowanie po maksymalnym ratingu
      if (filter?.max_rating != null) {
        filteredSuppliers = filteredSuppliers.filter(
          s => s.rating <= filter.max_rating
        );
      }
    
      // Filtrowanie po nazwie
      if (filter?.name_contains) {
        filteredSuppliers = filteredSuppliers.filter(
          s => s.name.toLowerCase().includes(filter.name_contains.toLowerCase())
        );
      }
      // filtorwanie po ratingu rownym 
      if(filter?.rating_equals !== undefined){
        filteredSuppliers = filteredSuppliers.filter(
          s => s.rating === filter.rating_equals
        )
      }
       // filtorwanie po ratingu  nie rownym 
       if(filter?.ratung_not_equals !== undefined){
        filteredSuppliers = filteredSuppliers.filter(
          s => s.rating !== filter.ratung_not_equals
        )
      }

      // Sortowanie
      if (sortBy) {
        filteredSuppliers.sort((a, b) => {
          let aValue = a;
          let bValue = b;
      
          // Obsługa zagnieżdżonych pól (np. "contact_info.phone")
          if (sortBy.includes('.')) {
            const keys = sortBy.split('.');
            aValue = keys.reduce((obj, key) => (obj ? obj[key] : undefined), a);
            bValue = keys.reduce((obj, key) => (obj ? obj[key] : undefined), b);
          } else {
            aValue = a[sortBy];
            bValue = b[sortBy];
          }
      
          // Obsługa wartości undefined/null
          if (aValue == null) return sortOrder === 'desc' ? 1 : -1;
          if (bValue == null) return sortOrder === 'desc' ? -1 : 1;
      
          // Sortowanie alfabetyczne lub numeryczne
          if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
          if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }
    
      // Paginate the results
      // Paginacja i offset
      if (offset != null && limit != null) {
        // Jeśli podano zarówno offset, jak i limit
        filteredSuppliers = filteredSuppliers.slice(offset, offset + limit);
      } else if (offset != null) {
        // Jeśli podano tylko offset
        filteredSuppliers = filteredSuppliers.slice(offset);
      } else if (limit != null) {
        // Jeśli podano tylko limit
        filteredSuppliers = filteredSuppliers.slice(0, limit);
      }
    
      return filteredSuppliers;
    },

    categories: () => {
      try {
        return categories;
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error.message);
        throw new Error("Nie można wczytać kategorii.");
      }
    },

  },
  

  Product: {
    supplier: (product) => {
      const supplier = suppliers.find(s => s.id_supplier === product.id_supplier);
      return supplier || null;
    },
    category: (product) => {
      const category = categories.find(c => c.id_category === product.category_id);
      return category || null;
    },
  },

  


  Mutation: {
    
    addProduct: (_, { input }) => {
      const category = categories.find(c => c.id_category === parseInt(input.category_id, 10));
      if (!category) {
        throw new Error(`Category with ID ${input.category_id} does not exist.`);
      }

      const supplier = suppliers.find(s => s.id_supplier === parseInt(input.supplier_id, 10));
      if (!supplier) {
        throw new Error(`Supplier with ID ${input.supplier_id} does not exist.`);
      }

      const newProduct = {
        id: products.length + 1,
        name: input.name,
        category_id: parseInt(input.category_id, 10),
        id_supplier: parseInt(input.supplier_id, 10),
        nutritional_values: {
          carbohydrates: input.nutritional_values.carbohydrates,
          proteins: input.nutritional_values.proteins,
          fats: input.nutritional_values.fats,
        },
      };

      products.push(newProduct);
      
      saveToFile('./data/products.json', products );

      return newProduct;
    },
    deleteProduct: (_, {id}) => {
      const productIndex = products.findIndex( p => p.id === parseInt(id, 10));
      if(productIndex === -1){
        throw new Error(`Product with ID ${id} dose not exist`)
      }
  
      const [deleteProduct] = products.splice(productIndex ,1);
  
      const filePath = path.resolve('./data/products.json');
      try{
        fs.writeFileSync(filePath, JSON.stringify(products, null,2));
      } catch(error){
        console.log("blad zapisu pliku JSON", error)
        throw new Error('nie udalo sie zaktualizowac danych w pliku json')
      }
  
      return deleteProduct;
    },
    
    updateProduct: (_, { id, input }) => {
      // Znajdź produkt po ID
      const productIndex = products.findIndex(p => p.id === parseInt(id, 10));
      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} does not exist.`);
      }
    
      // Pobierz istniejący produkt
      const existingProduct = products[productIndex];
    
      // Zaktualizuj tylko dozwolone pola
      const updatedProduct = {
        id: existingProduct.id, // ID niezmienione
        name: input.name || existingProduct.name, // Jeśli podano, aktualizuj nazwę
        category_id: input.category_id
          ? parseInt(input.category_id, 10)
          : parseInt(existingProduct.category_id), // Aktualizuj kategorię
        id_supplier: input.supplier_id
          ? parseInt(input.supplier_id, 10)
          : existingProduct.id_supplier, // Aktualizuj dostawcę
        nutritional_values: {
          carbohydrates: input.nutritional_values?.carbohydrates ?? existingProduct.nutritional_values.carbohydrates,
          proteins: input.nutritional_values?.proteins ?? existingProduct.nutritional_values.proteins,
          fats: input.nutritional_values?.fats ?? existingProduct.nutritional_values.fats,
        },
      };
    
      // Usuń nadmiarowe pola (jeśli przez przypadek się dodały)
      delete updatedProduct.supplier_id;
    
      // Zaktualizuj tablicę produktów
      products[productIndex] = updatedProduct;
    
        saveToFile('./data/products.json', products );
    
      // Zwróć zmodyfikowany produkt
      return updatedProduct;
    },

    addSupplier: (_ ,{input }) => {
      const newSupplier = {
        id_supplier: suppliers.length + 1,
        name: input.name,
        contact_info:{
          address: input.contact_info.address,
          phone: input.contact_info.phone
        },
        rating: input.rating
      };
      suppliers.push(newSupplier);

      const filePath = path.resolve('./data/suppliers.json');
      try {
        fs.writeFileSync(filePath, JSON.stringify(suppliers, null, 2));
      } catch (error) {
        console.error('Błąd zapisu do pliku JSON:', error);
        throw new Error('Nie udało się zapisać danych do pliku.');
      }

      return newSupplier;
    },

    deleteSupplier: (_, {id}) => {
        const supplierIndex = suppliers.findIndex( s => s.id_supplier === parseInt(id, 10));

        if(supplierIndex === -1){
          throw new Error(` Supplier wit ID ${id} dose not exist`)
        }

        const [deleteSupplier] = suppliers.splice(supplierIndex, 1);

      saveToFile('./data/suppliers.json', suppliers );

      return deleteSupplier;

    },

    updateSupplier: (_, { id, input }) => {
      // Znajdź dostawcę po ID
      const supplierIndex = suppliers.findIndex(s => s.id_supplier === parseInt(id, 10));
      if (supplierIndex === -1) {
        throw new Error(`Supplier with ID ${id} does not exist.`);
      }
    
      // Pobierz istniejącego dostawcę
      const existingSupplier = suppliers[supplierIndex];
    
      // Zaktualizuj tylko te pola, które zostały podane w `input`
      const updatedSupplier = {
        id_supplier: existingSupplier.id_supplier, // ID pozostaje niezmienione
        name: input.name !== undefined ? input.name : existingSupplier.name,
        contact_info: {
          address: input.contact_info?.address !== undefined ? input.contact_info.address : existingSupplier.contact_info.address,
          phone: input.contact_info?.phone !== undefined ? input.contact_info.phone : existingSupplier.contact_info.phone,
        },
        rating: input.rating !== undefined ? input.rating : existingSupplier.rating,
      };
    
      // Zaktualizuj tablicę dostawców
      suppliers[supplierIndex] = updatedSupplier;

      saveToFile('./data/suppliers.json', suppliers );  
    
      // Zwróć zmodyfikowanego dostawcę
      return updatedSupplier;
    },

    addCategory:(_,{input}) => {
        const newCategory ={
          id_category: categories.length + 1,
          name: input.name,
          main_category: input.main_category,
          description: input.description
        };

        categories.push(newCategory);

      saveToFile('./data/categories.json', categories );

      return newCategory;

    },

    updateCategory:(_, {id, input}) => {
      const categoryIndex = categories.findIndex(c => c.id_category === parseInt(id, 10));

      if(categoryIndex === -1){
        throw new Error(`Category with ID ${id} does not exist.`);
      }

      const existingCategory = categories[categoryIndex];

      const updatedCategory = {
        id_category: existingCategory.id_category,
        name: input.name !== undefined ? input.name : existingCategory.name,
        main_category: input.main_category !== undefined ? input.main_category : existingCategory.main_category,
        description: input.description !== undefined ? input.description : existingCategory.description
      };

      categories[categoryIndex] = updatedCategory;
     
      saveToFile('./data/categories.json', categories );
    },

    deleteCategory:(_, {id}) =>{
      const categoryIndex = categories.findIndex(c => c.id_category === parseInt(id, 10));

      if(categoryIndex === -1){
        throw new Error(`Category with ID ${id} does not exist.`);
      }

      const [deleteCategory] = categories.splice(categoryIndex,1);

      saveToFile('./data/categories.json', categories );
      return deleteCategory;
    },

  },

};

export default resolvers;