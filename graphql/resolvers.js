import products from '../data/products.json' assert { type: 'json' };
import categories from '../data/categories.json' assert { type: 'json' };
import suppliers from '../data/suppliers.json' assert { type: 'json' };

const resolvers = {
  Query: {
    // Pobieranie wszystkich produktów
    products: () => products,

    // Pobieranie pojedynczego produktu po ID
    product: (_, { id }) => products.find(product => product.id === parseInt(id)),

    // Pobieranie wszystkich kategorii
    categories: () => categories,

    // Pobieranie jednej kategorii po ID
    category: (_, { id_category }) => categories.find(category => category.id_category === parseInt(id_category)),

    // Pobieranie wszystkich dostawców
    suppliers: () => suppliers,

    // Pobieranie jednego dostawcy po ID
    supplier: (_, { id_supplier }) => suppliers.find(supplier => supplier.id_supplier === parseInt(id_supplier)),
  },

  Product: {
    // Pobieranie dostawcy dla produktu
    id_supplier: (product) => suppliers.find(supplier => supplier.id_supplier === product.id_supplier),

    // Pobieranie kategorii dla produktu
    category_id: (product) => categories.find(category => category.id_category === product.category_id),
  },
};

export default resolvers;

