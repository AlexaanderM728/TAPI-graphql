import { gql } from 'graphql-tag';

// Definicja schematu GraphQL
const typeDefs = gql`
  # Scalar pozwala zdefiniować niestandardowe typy danych, np. do walidacji.
  scalar PhoneNumber
  scalar NutritionalValue



  # Typ reprezentujący produkt
  type Product {
    id: ID!                           # ID produktu
    name: String!                     # Nazwa produktu
    category_id: ID!                  # ID kategorii
    category: Category                # Pelne dane kategorii
    id_supplier: ID!  
    supplier:Supplier                #Pelne dane dostawcy
    nutritional_values: NutritionalValues! # Wartości odżywcze
  }

  # Typ wejściowy do tworzenia produktu
  input ProductInput {
    name: String!                     # Nazwa produktu
    category_id: ID!                  # ID kategorii
    supplier_id: ID!                  # ID dostawcy
    nutritional_values: NutritionalValuesInput! # Wartości odżywcze
  }

  input UpdateProductInput{
    name: String
    category_id: ID
    supplier_id: ID
    nutritional_values: UpdateNutritionalValuesInput
  }

  # Typ dla wartości odżywczych produktu
  type NutritionalValues {
    carbohydrates: NutritionalValue!             # Węglowodany
    proteins: NutritionalValue!                  # Białko
    fats: NutritionalValue!                      # Tłuszcz
  }

   # Typ wejściowy dla wartości odżywczych
   input NutritionalValuesInput {
    carbohydrates: NutritionalValue!             # Węglowodany
    proteins: NutritionalValue!                  # Białko
    fats: NutritionalValue!                      # Tłuszcz
  }

  input UpdateNutritionalValuesInput {
    carbohydrates: NutritionalValue            # Węglowodany
    proteins: NutritionalValue                 # Białko
    fats: NutritionalValue                    # Tłuszcz
  }

  # Typ reprezentujący kategorię produktów
  type Category {
    id_category: ID!                  # ID kategorii
    name: String!                     # Nazwa kategorii
    main_category: String!             # Główna kategoria
    description: String!               # Opis kategorii
  }

  input CategoryInput{                
    name: String!                     # Nazwa kategorii
    main_category: String!             # Główna kategoria
    description: String! 
  }

  input UpdateCategoryInput{                
    name: String                  # Nazwa kategorii
    main_category: String            # Główna kategoria
    description: String
  }

  # Typ reprezentujący dostawcę
  type Supplier {
    id_supplier: ID!                  # ID dostawcy
    name: String!                     # Nazwa dostawcy
    contact_info: ContactInfo!        # Dane kontaktowe
    rating: Float                     # Ocena dostawcy
  }

  input SupplierInput {
    name: String!
    rating: Float
    contact_info: ContactInfoInput!
  }

  input UpdateSupplierInput{
    name: String
    rating: Float
    contact_info: UpdateContactInfoInput
  }

  # Typ dla danych kontaktowych dostawcy
  type ContactInfo {
    address: String!                  # Adres
    phone: PhoneNumber!               # Numer telefonu
  }

  input ContactInfoInput {
    address: String!
    phone: PhoneNumber!
  }

  input UpdateContactInfoInput{
    address: String
    phone: PhoneNumber
  }
 

  # Typ wejściowy do filtrowania produktów
  input ProductFilter {
    name: String
    category_id: ID
    supplier_id: ID
    min_carbohydrates: Float
    max_carbohydrates: Float
    min_proteins: Float
    max_proteins: Float
    min_fats: Float
    max_fats: Float
    min_rating: Float
    max_rating: Float
  }

  input SupplierFilter {
    min_rating: Float
    max_rating: Float
    name_contains: String
  }

  # Typ zapytań
  type Query {
    products(filter: ProductFilter, limit: Int, offset: Int, sortBy: String, sortOrder: String): [Product!]!
    product(id: ID!): Product
    categories: [Category!]!
    category(id_category: ID!): Category
    suppliers(filter: SupplierFilter, limit: Int, offset: Int, sortBy: String, sortOrder: String): [Supplier!]!
    supplier(id_supplier: ID!): Supplier
  }

  # Typ mutacji
  type Mutation {
    addProduct(input: ProductInput!): Product # Dodaj nowy produkt
    deleteProduct(id: ID!): Product # usuwanie pojedynczego produktu
    updateProduct(id: ID!, input: UpdateProductInput!): Product # aktualizacja danych porduktu 

    addSupplier(input: SupplierInput!): Supplier
    deleteSupplier(id: ID!): Supplier
    updateSupplier(id: ID!, input: UpdateSupplierInput!): Supplier

    addCategory(input: CategoryInput!): Category
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category
    deleteCategory(id: ID!): Category
  }
`;

export default typeDefs;